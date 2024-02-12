import jwt, { Secret, SignOptions, VerifyOptions } from "jsonwebtoken";
import { RedisCache } from "../config/Redis";
import { TokenRevocationController } from "../controllers/TokenRevocationController";
import { User } from "../interfaces/User";

export class JwtService {
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

    RedisCache.setex(
      cacheKey,
      parseInt(expiresIn) + 60,
      JSON.stringify(payload)
    );

    return token;
  }

  static generateAccessToken(user: User): string {
    return this.generateToken(user, "15m", `access-token:${user.id}`);
  }

  static generateRefreshToken(user: User): string {
    return this.generateToken(user, "7d", `refresh-token:${user.id}`);
  }

  static async verifyAccessToken(
    token: string
  ): Promise<User | null | undefined> {
    const cachedUser = await RedisCache.get(`access-token:${token}`);
    if (cachedUser) {
      return JSON.parse(cachedUser);
    }

    const isTokenRevoked = await TokenRevocationController.isTokenRevoked(
      token
    );
    if (isTokenRevoked) {
      return null;
    }

    try {
      const options: VerifyOptions = {
        algorithms: [this.algorithm as jwt.Algorithm],
        issuer: this.issuer,
      };

      const payload = jwt.verify(token, this.secretKey, options) as User;

      RedisCache.setex(
        `access-token:${payload.id}`,
        900,
        JSON.stringify(payload)
      );

      return payload;
    } catch (error) {
      console.error("Erro durante verificação de token de acesso:", error);
      return null;
    }
  }

  static async verifyRefreshToken(
    token: string
  ): Promise<User | null | undefined> {
    const cachedUser = await RedisCache.get(`refresh-token:${token}`);
    if (cachedUser) {
      return JSON.parse(cachedUser);
    }

    const isTokenRevoked = await TokenRevocationController.isTokenRevoked(
      token
    );
    if (isTokenRevoked) {
      return null;
    }

    try {
      const options: VerifyOptions = {
        algorithms: [this.algorithm as jwt.Algorithm],
        issuer: this.issuer,
      };

      const payload = jwt.verify(token, this.secretKey, options) as User;

      RedisCache.setex(
        `refresh-token:${payload.id}`,
        604800,
        JSON.stringify(payload)
      );

      return payload;
    } catch (error) {
      console.error("Erro durante verificação de token de atualização:", error);
      return null;
    }
  }

  static decodeToken(token: string): { [key: string]: any } | null {
    try {
      const decoded = jwt.decode(token);
      return decoded ? (decoded as { [key: string]: any }) : null;
    } catch (error) {
      console.error("Erro durante decodificação de token:", error);
      return null;
    }
  }

  static async refreshTokens(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      const user = await JwtService.verifyRefreshToken(refreshToken);

      if (user) {
        const newAccessToken = JwtService.generateAccessToken(user);

        return {
          accessToken: newAccessToken,
          refreshToken,
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Erro durante renovação de tokens:", error);
      return null;
    }
  }
}
