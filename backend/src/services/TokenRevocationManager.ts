import { Database } from "../config/Database";
import { RedisCache } from "../config/Redis";
import { TokenRevocationData } from "../interfaces/TokenRevocationData";
import { LoggerManager } from "./LoggerManager";

/**
 * Classe TokenRevocationManager responsável por revogar e verificar se um token foi revogado.
 */
export class TokenRevocationManager {
  /**
   * Verifica se um token foi revogado.
   * @param token - Token a ser verificado.
   * @returns True se o token foi revogado, false caso contrário.
   */
  static async isTokenRevoked(token: string): Promise<boolean> {
    // Verifica se o token está no cache do Redis
    const cachedRevoked = await RedisCache.get(`revogado-token:${token}`);
    if (cachedRevoked) {
      return true;
    }

    // Verifica se o token está na tabela de tokens revogados no banco de dados
    try {
      const result = await Database.query(
        "SELECT * FROM tokens_revogados WHERE token = $1",
        [token]
      );

      if (result.rows.length > 0) {
        // Armazena o token no cache do Redis com um tempo de expiração específico (em segundos)
        RedisCache.setex(`revogado-token:${token}`, 604800, "true");
        LoggerManager.logInfo("Token revogado encontrado no banco de dados", {
          token: this.maskToken(token),
        });
        return true;
      }

      return false;
    } catch (error) {
      LoggerManager.logError(
        error as Error,
        "Erro ao verificar token revogado no banco de dados",
        { token: this.maskToken(token) }
      );
      throw error;
    }
  }

  /**
   * Adiciona um token revogado à tabela de tokens revogados.
   * @param tokenRevocationData - Dados para revogar o token.
   * @returns {Promise<void>}
   */
  static async revokeToken(
    tokenRevocationData: TokenRevocationData
  ): Promise<void> {
    const { userId, token, revokedAt, expiresAt } = tokenRevocationData;

    // Adiciona o token revogado à tabela de tokens revogados
    try {
      await Database.query(
        "INSERT INTO tokens_revogados (id, token, user_id, revoked_at, expires_at) VALUES (uuid_generate_v4(), $1, $2, $3, $4)",
        [token, userId, revokedAt, expiresAt]
      );

      // Armazena o token no cache do Redis com um tempo de expiração específico (em segundos)
      RedisCache.setex(`revogado-token:${token}`, 604800, "true");
      LoggerManager.logInfo("Token revogado adicionado ao banco de dados", {
        token: this.maskToken(token),
      });
    } catch (error) {
      LoggerManager.logError(error as Error, "Erro ao revogar token", {
        token: this.maskToken(token),
      });
      throw error;
    }
  }

  // Função para mascarar tokens
  private static maskToken(token: string): string {
    return `${token.substring(0, 5)}...${token.substring(token.length - 5)}`;
  }
}
