import jwt, { Secret, SignOptions, VerifyOptions } from "jsonwebtoken";
import { TokenRevocationController } from "../controller/TokenRevocationController";
import { User as UserType } from "../interfaces/User";
import { AppLogger } from "../config/AppLogger";

export default class JwtService {
  private static readonly secretKey: Secret =
    process.env.JWT_SECRET_KEY_REFRESH || "secret-key";
  private static readonly algorithm: string = "HS256";
  private static readonly issuer: string = "SIPE";

  /**
   * Gera um token de acesso
   * @param refreshToken - token de atualização
   * @returns token de acesso
   */
  private static async generateAccessToken(refreshToken): Promise<string> {
    const payload = this.decodeToken(refreshToken);
    const options: SignOptions = {
      algorithm: this.algorithm as jwt.Algorithm,
      expiresIn: "15m",
      issuer: this.issuer,
      subject: payload.id,
    };
    AppLogger.getInstance().info("Token de acesso gerado com sucesso");
    return jwt.sign(payload, refreshToken, options);
  }

  /**
   * Gera um token de atualização
   * @param user - usuário a quem o token pertence
   * @returns token de atualização
   */
  private static async generateRefreshToken(user: UserType): Promise<string> {
    const payload = {
      id: user.id,
      personalData: user.personalData,
      employmentData: user.employmentData,
      permissions: user.permissions,
      iss: this.issuer,
    };
    const options: SignOptions = {
      algorithm: this.algorithm as jwt.Algorithm,
      expiresIn: "7d",
      issuer: this.issuer,
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
  private static decodeToken(token: string): UserType {
    return jwt.decode(token) as UserType;
  }

  /**
   * Verifica se um token é válido
   * @param token - token a ser verificado
   * @returns true se o token for válido, false caso contrário
   */
  private static async verifyRefreshToken(token: string): Promise<boolean> {
    const options: VerifyOptions = {
      algorithms: [this.algorithm as jwt.Algorithm],
      issuer: this.issuer,
    };
    try {
      const decoded = jwt.verify(token, this.secretKey, options);
      const id = (decoded as UserType).id;
      if (await TokenRevocationController.isTokenRevoked(id, token)) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      AppLogger.getInstance().error(
        `Erro ao verificar token de atualização. Token: ${token}, Erro: ${error}`
      );
      return false;
    }
  }

  /**
   * Verifica se um token é válido
   * @param token - token a ser verificado
   * @param refreshToken - token de atualização
   * @returns - true se o token for válido, false caso contrário
   */
  private static async verifyAccessToken(
    token: string,
    refreshToken: string
  ): Promise<boolean> {
    const options: VerifyOptions = {
      algorithms: [this.algorithm as jwt.Algorithm],
      issuer: this.issuer,
    };
    try {
      jwt.verify(token, refreshToken, options);
      return true;
    } catch (error) {
      AppLogger.getInstance().error(
        `Erro ao verificar token de acesso. Token: ${token}, Erro: ${error}`
      );
      return false;
    }
  }

  /**
   * Gera um token de acesso e um token de atualização
   * @param user - usuário a quem os tokens pertencem
   * @returns - um objeto contendo o token de acesso e o token de atualização
   */
  private static async generateTokens(
    user: UserType
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = await this.generateRefreshToken(user);
    const accessToken = await this.generateAccessToken(refreshToken);
    return { accessToken, refreshToken };
  }
}
