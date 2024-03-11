import jwt, { Secret, SignOptions, VerifyOptions } from "jsonwebtoken";
import { User as UserType } from "../interfaces/User";
import { AppLogger } from "../config/AppLogger";

export class JwtService {
  private static readonly secretKey: Secret =
    process.env.JWT_SECRET_KEY_REFRESH || "secret-key";
  private static readonly algorithm: string = "HS256";

  /**
   * Gera um token de acesso
   * @param refreshToken - token de atualização
   * @returns token de acesso
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
   * Gera um token de atualização
   * @param user - usuário a quem o token pertence
   * @returns token de atualização
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
   * Decodifica um token
   * @param token - token a ser decodificado
   * @returns - retorna o payload do token
   */
  private static decodeToken<T>(token: string): T {
    return jwt.decode(token) as T;
  }

  /**
   * Verifica se um token é válido
   * @param token - token a ser verificado
   * @param secretOrPublicKey - chave secreta ou pública
   * @returns - true se o token for válido, false caso contrário
   */
  private static async verifyToken(
    token: string,
    secretOrPublicKey: Secret
  ): Promise<boolean> {
    const options: VerifyOptions = {
      algorithms: [this.algorithm as jwt.Algorithm],
    };

    try {
      jwt.verify(token, secretOrPublicKey, options);
      return true;
    } catch (error) {
      AppLogger.getInstance().error(
        `Erro ao verificar token. Token: ${token}, Erro: ${error}`
      );
      return false;
    }
  }
  /**
   * Verifica se um token é válido
   * @param token - token a ser verificado
   * @returns true se o token for válido, false caso contrário
   */
  public static async verifyRefreshToken(token: string): Promise<boolean> {
    return this.verifyToken(token, this.secretKey);
  }

  /**
   * Verifica se um token é válido
   * @param token - token a ser verificado
   * @param refreshToken - token de atualização
   * @returns - true se o token for válido, false caso contrário
   */
  public static async verifyAccessToken(
    token: string,
    refreshToken: string
  ): Promise<boolean> {
    return this.verifyToken(token, refreshToken);
  }

  /**
   * Gera um token de acesso e um token de atualização
   * @param user - usuário a quem os tokens pertencem
   * @returns - um objeto contendo o token de acesso e o token de atualização
   */
  public static async generateTokens(
    user: UserType
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = await this.generateRefreshToken(user);
    const accessToken = await this.generateAccessToken(refreshToken);
    return { accessToken, refreshToken };
  }
}
