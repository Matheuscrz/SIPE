import { RedisCache } from "../config/Redis";
import { Database } from "../config/Database";
import { AppLogger } from "../config/AppLogger";

/*
 * Classe de controle para revogação de tokens
 */
export class TokenRevocationController {
  private static readonly TABLE_REFRESH_TOKEN = "point.login_tokens";
  private static readonly TABLE_REVOKED_TOKEN = "point.revoked_tokens";

  /**
   *Verifica se o token está na lista de tokens revogados
   * @param id - id do usuário a quem o token pertence
   * @param token - token a ser verificado
   * @returns true se o token estiver na lista de tokens revogados, false caso contrário
   */
  static async isTokenRevoked(id: string, token: string): Promise<boolean> {
    const query = `SELECT * FROM ${this.TABLE_REVOKED_TOKEN} WHERE token = $1`;
    try {
      const result = await Database.query(query, [token]);
      if (result.rows.length > 0) {
        AppLogger.getInstance().info(`Token revogado: ${token}`);
        return true;
      } else {
        AppLogger.getInstance().info(`Token não revogado: ${token}`);
        return false;
      }
    } catch (error) {
      AppLogger.getInstance().error(
        `Erro ao verificar token revogado. ID: ${id}. Erro: ${error}`
      );
      throw error;
    }
  }
  /**
   * Adiciona um token à lista de tokens revogados e ao cache
   * @param id - id do usuário a quem o token pertence
   * @param token - token a ser revogado
   * @returns {Promise<void>}
   */
  static async revokeToken(id: string, token: string): Promise<void> {
    const deleteQuery = `DELETE FROM ${this.TABLE_REFRESH_TOKEN} WHERE user_id = $1 AND token = $2`;
    const insertQuery = `INSERT INTO ${this.TABLE_REVOKED_TOKEN} token VALUES ($1)`;
    try {
      await Database.query(deleteQuery, [id, token]);
      await Database.query(insertQuery, [token]);
      await RedisCache.set(id, token);
      AppLogger.getInstance().info(`Token revogado com sucesso. ID: ${id}`);
    } catch (error) {
      AppLogger.getInstance().error(
        `Erro ao revogar token. ID: ${id}. Erro: ${error}`
      );
      throw error;
    }
  }
}
