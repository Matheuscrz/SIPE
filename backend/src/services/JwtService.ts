import jwt, { Secret, SignOptions, VerifyOptions } from "jsonwebtoken";
import { User as UserType } from "../interfaces/User";
import { AppLogger } from "../config/AppLogger";

/**
 * @class JwtService
 * @description Classe de serviço para manipulação de tokens JWT
 */
export class JwtService {
  private static readonly secretKey: Secret =
    process.env.JWT_SECRET_KEY_REFRESH || "secret";
  private static readonly algorithm: string = "HS512";

  /**
   * @param refreshToken Token de atualização
   * @returns Token de acesso
   * @throws {ErrorHandler} Erro ao gerar token de acesso
   * @description Método para gerar um token de acesso
   */
  public static async generateAccessToken(
    refreshToken: string
  ): Promise<string> {
    const payload = this.decodeToken<UserType>(refreshToken);
    delete payload.exp;
    const options: SignOptions = {
      algorithm: this.algorithm as jwt.Algorithm,
      expiresIn: "15m",
    };
    AppLogger.getInstance().info("Token de acesso gerado com sucesso");
    return jwt.sign(payload, refreshToken, options);
  }

  /**
   * @param user Usuário
   * @returns Token de atualização
   * @throws {ErrorHandler} Erro ao gerar token de atualização
   * @description Método para gerar um token de atualização
   */
  public static async generateRefreshToken(user: UserType): Promise<string> {
    const payload = {
      id: user.id,
      name: user.name,
      cpf: user.cpf,
    };
    const options: SignOptions = {
      algorithm: this.algorithm as jwt.Algorithm,
      expiresIn: "7d",
      subject: user.id,
    };
    AppLogger.getInstance().info("Token de atualização gerado com sucesso");
    return jwt.sign(payload, this.secretKey, options);
  }

  /**
   * @param token Token
   * @returns Objeto decodificado
   * @description Método para decodificar um token
   */
  private static decodeToken<T>(token: string): T {
    return jwt.decode(token) as T;
  }

  /**
   * @param token Token
   * @param secretOrPublicKey Chave secreta ou pública
   * @returns true se o token for válido, false caso contrário
   * @description Método para verificar se um token é válido
   * @throws {ErrorHandler} Erro ao verificar token
   */
  private static async verifyToken(
    token: string,
    secretOrPublicKey: Secret
  ): Promise<boolean> {
    const options: VerifyOptions = {
      algorithms: [this.algorithm as jwt.Algorithm],
    };

    try {
      if (jwt.verify(token, secretOrPublicKey, options)) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      AppLogger.getInstance().error(`Erro ao verificar token. Erro: ${error}`);
      return false;
    }
  }
  /**
   * @param token Token
   * @returns true se o token for válido, false caso contrário
   * @description Método para verificar se um token de acesso é válido
   * @throws {ErrorHandler} Erro ao verificar token
   */
  public static async verifyRefreshToken(token: string): Promise<boolean> {
    return this.verifyToken(token, this.secretKey);
  }

  /**
   * @param token
   * @param refreshToken
   * @returns true se o token for válido, false caso contrário
   * @description Método para verificar se um token de acesso é válido
   */
  public static async verifyAccessToken(
    token: string,
    refreshToken: string
  ): Promise<boolean> {
    return this.verifyToken(token, refreshToken);
  }

  /**
   * @param user Usuário
   * @returns Objeto com accessToken e refreshToken
   * @description Método para gerar tokens de acesso e atualização
   */
  public static async generateTokens(
    user: UserType
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = await this.generateRefreshToken(user);
    const accessToken = await this.generateAccessToken(refreshToken);
    return { accessToken, refreshToken };
  }
}
