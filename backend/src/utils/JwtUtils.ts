import jwt, { Secret, SignOptions, VerifyOptions } from "jsonwebtoken";
import { RedisCache } from "../config/Redis";
import { User } from "../models/User";
import { TokenRevocationController } from "../controllers/TokenRevocationController";

/**
 * Classe JwtService responsável pela geração, verificação e decodificação de tokens JWT.
 */
class JwtService {
  private static readonly secretKey: Secret =
    process.env.JWT_SECRET || "secret-key"; // Chave secreta para assinar os tokens
  private static readonly algorithm: string = "HS256"; // Algoritmo de assinatura
  private static readonly issuer: string = "SIPE"; // Emissor dos tokens

  /**
   * Gera um token de acesso JWT com um tempo de expiração de 15 minutos.
   * @param user - Objeto User contendo informações do usuário.
   * @returns Token de acesso JWT.
   */
  static generateAccessToken(user: User): string {
    const payload = {
      id: user.id,
      personalData: user.personalData,
      employmentData: user.employmentData,
      permissions: user.permissions,
      iss: this.issuer,
    };

    const options: SignOptions = {
      expiresIn: "15m",
      algorithm: this.algorithm as jwt.Algorithm,
    };

    const token = jwt.sign(payload, this.secretKey, options);

    // Armazena o token no cache do Redis com um tempo de expiração de 16 minutos (em segundos)
    RedisCache.setex(`access-token:${user.id}`, 960, token);

    return token;
  }

  /**
   * Gera um token de atualização JWT com um tempo de expiração de 7 dias.
   * @param user - Objeto User contendo informações do usuário.
   * @returns Token de atualização JWT.
   */
  static generateRefreshToken(user: User): string {
    const payload = {
      id: user.id,
      personalData: user.personalData,
      employmentData: user.employmentData,
      permissions: user.permissions,
      iss: this.issuer,
    };

    const options: SignOptions = {
      expiresIn: "7d",
      algorithm: this.algorithm as jwt.Algorithm,
    };

    const refreshToken = jwt.sign(payload, this.secretKey, options);

    // Armazena o token no cache do Redis com um tempo de expiração de 7 dias (em segundos)
    RedisCache.setex(`refresh-token:${user.id}`, 604800, refreshToken);

    return refreshToken;
  }

  /**
   * Verifica a validade de um token de acesso JWT e retorna as informações do usuário.
   * Verifica se o token está no cache do Redis e se não foi revogado antes de realizar uma verificação completa.
   * @param token - Token de acesso JWT a ser verificado.
   * @returns Objeto User ou null se o token for inválido.
   */
  static async verifyToken(token: string): Promise<User | null> {
    // Verifica se o token está no cache do Redis
    const cachedUser = await RedisCache.get(`access-token:${token}`);
    if (cachedUser) {
      return JSON.parse(cachedUser);
    }

    // Verifica se o token foi revogado
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

      // Armazena o usuário no cache do Redis com um tempo de expiração de 15 minutos
      RedisCache.setex(
        `access-token:${payload.id}`,
        900,
        JSON.stringify(payload)
      );

      return payload;
    } catch (error) {
      console.error("Error verifying token:", error);
      return null;
    }
  }

  /**
   * Decodifica um token JWT e retorna seu payload.
   * @param token - Token JWT a ser decodificado.
   * @returns Payload do token ou null se o token for inválido.
   */
  static decodeToken(token: string): { [key: string]: any } | null {
    try {
      const decoded = jwt.decode(token);
      return decoded ? (decoded as { [key: string]: any }) : null;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }
}

export default JwtService;
