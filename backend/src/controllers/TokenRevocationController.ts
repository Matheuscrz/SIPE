import { RedisCache } from "../config/Redis";
import { Database } from "../config/Database";

/**
 * Classe TokenRevocationController responsável por verificar se um token foi revogado.
 */
export class TokenRevocationController {
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
        return true;
      }

      return false;
    } catch (error) {
      console.error(
        "Erro ao verificar token revogado no banco de dados",
        error
      );
      throw error;
    }
  }

  /**
   * Adiciona um token revogado à tabela de tokens revogados.
   * @param token - Token a ser revogado.
   * @param expiresAt - Data de expiração do token.
   * @returns {Promise<void>}
   */
  static async revokeAccessToken(
    token: string,
    expiresAt: Date
  ): Promise<void> {
    // Adiciona o token revogado à tabela de tokens revogados
    try {
      await Database.query(
        "INSERT INTO tokens_revogados (id, token, expires_at) VALUES (uuid_generate_v4(), $1, $2)",
        [token, expiresAt]
      );

      // Armazena o token no cache do Redis com um tempo de expiração específico (em segundos)
      RedisCache.setex(`revogado-token:${token}`, 604800, "true");
    } catch (error) {
      console.error("Erro ao revogar token de acesso", error);
      throw error;
    }
  }

  /**
   * Adiciona um token refresh revogado à tabela de tokens revogados.
   * @param refreshToken - Token refresh a ser revogado.
   * @param expiresAt - Data de expiração do token refresh.
   * @returns {Promise<void>}
   */
  static async revokeRefreshToken(
    refreshToken: string,
    expiresAt: Date
  ): Promise<void> {
    // Adiciona o token refresh revogado à tabela de tokens revogados
    try {
      await Database.query(
        "INSERT INTO tokens_revogados (id, token, expires_at) VALUES (uuid_generate_v4(), $1, $2)",
        [refreshToken, expiresAt]
      );

      // Remove o token refresh da tabela login_tokens
      await Database.query(
        "DELETE FROM tokens_login WHERE refresh_token = $1",
        [refreshToken]
      );

      // Armazena o token no cache do Redis com um tempo de expiração específico (em segundos)
      RedisCache.setex(`revogado-token:${refreshToken}`, 604800, "true");
    } catch (error) {
      console.error("Erro ao revogar token refresh", error);
      throw error;
    }
  }
}
