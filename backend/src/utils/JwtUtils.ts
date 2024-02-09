import * as jwt from "jsonwebtoken";
import { UserEntity } from "../models/User";

export class JwtUtils {
  // Chave secreta usada para assinar os tokens JWT
  private static readonly secretKey = process.env.JWT_SECRET || "secretKey";

  // Algoritmo de assinatura usado para gerar os tokens JWT
  private static readonly algorithm = "HS256";

  // Emissor do token (issuer)
  private static readonly issuer = "SIPE";

  // Método estático para gerar um token de acesso
  static generateAccessToken(user: UserEntity): string {
    // Assinar o token com informações do usuário e opções específicas
    return jwt.sign(
      { id: user.id, username: user.username, iss: this.issuer },
      this.secretKey,
      {
        expiresIn: "15m", // Tempo de expiração do token (15 minutos)
        algorithm: this.algorithm,
      }
    );
  }

  // Método estático para gerar um token de atualização
  static generateRefreshToken(user: UserEntity): string {
    // Assinar o token de atualização com informações do usuário e opções específicas
    return jwt.sign(
      { id: user.id, username: user.username, iss: this.issuer },
      this.secretKey,
      {
        expiresIn: "7d", // Tempo de expiração do token de atualização (7 dias)
        algorithm: this.algorithm,
      }
    );
  }

  // Método estático para verificar a validade de um token
  static verifyToken(token: string): any {
    // Verificar o token usando a chave secreta e o algoritmo especificado
    return jwt.verify(token, this.secretKey, { algorithms: [this.algorithm] });
  }
}
