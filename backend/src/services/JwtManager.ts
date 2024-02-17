import jwt, { Secret, SignOptions, VerifyOptions } from "jsonwebtoken";
import { RedisCache } from "../config/Redis";
import { TokenRevocationManager } from "./TokenRevocationManager";
import { User } from "../interfaces/User";
import { LoggerManager } from "./LoggerManager";

export class JwtManager {
  private static readonly secretKey: Secret =
    process.env.JWT_SECRET || "secret-key";
  private static readonly algorithm: string = "HS256";
  private static readonly issuer: string = "SIPE";

  private static generateToken(
    user: User,
    expiresIn: string,
    cacheKey: string
  ): string {
    const payload = {
      id: user.id,
      personalData: user.personalData,
      employmentData: user.employmentData,
      permissions: user.permissions,
      iss: this.issuer,
    };

    const options: SignOptions = {
      expiresIn,
      algorithm: this.algorithm as jwt.Algorithm,
    };

    const token = jwt.sign(payload, this.secretKey, options);

    // Armazenar payload no cache
    RedisCache.setex(
      cacheKey,
      parseInt(expiresIn) + 60,
      JSON.stringify(payload)
    );

    return token;
  }

  // Função para mascarar tokens
  private static maskToken(token: string): string {
    const maskedLength = 5;
    if (token.length <= maskedLength * 2) {
      return "*".repeat(maskedLength);
    }

    return `${token.substring(0, maskedLength)}...${token.substring(
      token.length - maskedLength
    )}`;
  }

  static generateAccessToken(user: User): string {
    const accessToken = this.generateToken(
      user,
      "15m",
      `access-token:${user.id}`
    );
    // Registrar log de sucesso na geração de token de acesso
    LoggerManager.logInfo("Token de acesso gerado com sucesso", {
      token: this.maskToken(accessToken),
    });
    return accessToken;
  }

  static generateRefreshToken(user: User): string {
    const refreshToken = this.generateToken(
      user,
      "7d",
      `refresh-token:${user.id}`
    );
    // Registrar log de sucesso na geração de token de atualização
    LoggerManager.logInfo("Token de atualização gerado com sucesso", {
      token: this.maskToken(refreshToken),
    });
    return refreshToken;
  }

  /**
   * Remove o token de atualização do cache.
   * @param userId - ID do usuário.
   */
  static async removeRefreshTokenFromCache(userId: string): Promise<void> {
    try {
      // Remover token de atualização do cache
      await RedisCache.del(`refresh-token:${userId}`);
    } catch (error) {
      // Registrar erro ao remover token de atualização do cache
      LoggerManager.logError(
        error as Error,
        "Erro ao remover token de atualização do cache",
        { userId }
      );
      throw error;
    }
  }

  static async verifyAccessToken(
    token: string
  ): Promise<User | null | undefined> {
    const cachedUser = await RedisCache.get(`access-token:${token}`);
    if (cachedUser) {
      // Se o usuário estiver em cache, retornar diretamente
      return JSON.parse(cachedUser);
    }

    const isTokenRevoked = await TokenRevocationManager.isTokenRevoked(token);
    if (isTokenRevoked) {
      // Se o token estiver revogado, retornar null
      return null;
    }

    try {
      const options: VerifyOptions = {
        algorithms: [this.algorithm as jwt.Algorithm],
        issuer: this.issuer,
      };

      const payload = jwt.verify(token, this.secretKey, options) as User;

      // Armazenar payload no cache após a verificação bem-sucedida
      RedisCache.setex(
        `access-token:${payload.id}`,
        900,
        JSON.stringify(payload)
      );
      // Registrar log de sucesso na verificação de token de acesso
      LoggerManager.logInfo("Token de acesso verificado com sucesso", {
        token: this.maskToken(token),
      });
      return payload;
    } catch (error) {
      // Registrar erro durante a verificação de token de acesso
      LoggerManager.logError(
        error as Error,
        "Erro durante verificação de token de acesso",
        { token: this.maskToken(token) }
      );
      return null;
    }
  }

  static async verifyRefreshToken(
    token: string
  ): Promise<User | null | undefined> {
    const cachedUser = await RedisCache.get(`refresh-token:${token}`);
    if (cachedUser) {
      // Se o usuário estiver em cache, retornar diretamente
      return JSON.parse(cachedUser);
    }

    const isTokenRevoked = await TokenRevocationManager.isTokenRevoked(token);
    if (isTokenRevoked) {
      // Se o token estiver revogado, retornar null
      return null;
    }

    try {
      const options: VerifyOptions = {
        algorithms: [this.algorithm as jwt.Algorithm],
        issuer: this.issuer,
      };

      const payload = jwt.verify(token, this.secretKey, options) as User;

      // Armazenar payload no cache após a verificação bem-sucedida
      RedisCache.setex(
        `refresh-token:${payload.id}`,
        604800,
        JSON.stringify(payload)
      );
      // Registrar log de sucesso na verificação de token de atualização
      LoggerManager.logInfo("Token de atualização verificado com sucesso", {
        token: this.maskToken(token),
      });
      return payload;
    } catch (error) {
      // Registrar erro durante a verificação de token de atualização
      LoggerManager.logError(
        error as Error,
        "Erro durante verificação de token de atualização",
        { token: this.maskToken(token) }
      );
      return null;
    }
  }

  static decodeToken(token: string): { [key: string]: any } | null {
    try {
      const decoded = jwt.decode(token);
      return decoded ? (decoded as { [key: string]: any }) : null;
    } catch (error) {
      // Registrar erro durante a decodificação de token
      LoggerManager.logError(
        error as Error,
        "Erro durante decodificação de token",
        {
          token: this.maskToken(token),
        }
      );
      return null;
    }
  }

  static getExpirationDateFromToken(token: string): Date {
    const decoded: any = jwt.verify(token, this.secretKey);
    return new Date(decoded.exp * 1000);
  }

  static async refreshTokens(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      const user = await JwtManager.verifyRefreshToken(refreshToken);

      if (user) {
        // Se o usuário for válido, gerar novo token de acesso
        const newAccessToken = JwtManager.generateAccessToken(user);

        return {
          accessToken: newAccessToken,
          refreshToken,
        };
      } else {
        return null;
      }
    } catch (error) {
      // Registrar erro durante a renovação de tokens
      LoggerManager.logError(
        error as Error,
        "Erro durante renovação de tokens",
        {
          refreshToken: this.maskToken(refreshToken),
        }
      );
      return null;
    }
  }
}
