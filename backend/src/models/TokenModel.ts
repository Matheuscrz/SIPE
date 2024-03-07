import { AppLogger } from "../config/AppLogger";
import { Database } from "../config/Database";
import { ErrorHandler } from "../config/ErroHandler";
import { RedisCache } from "../config/Redis";

export class TokenModel {
  private static readonly TABLE_LOGIN = "point.login_tokens";
  private static readonly TABLE_REVOKED = "point.revoked_tokens";

  /**
   * Armazena um token de atualização no banco de dados e no Redis
   * @param id - ID do usuário
   * @param token - Token a ser revogado
   * @param expires_at - Data de expiração do token
   */
  static async storeToken(
    id: string,
    token: string,
    expires_at: Date
  ): Promise<void> {
    const query = `INSERT INTO ${this.TABLE_LOGIN} (id, token, expires_at) VALUES ($1, $2, $3)`;
    const values = [id, token, expires_at];
    try {
      await Database.query(query, values);
      AppLogger.getInstance().info(
        `Token refresh armazenado com sucesso. ID: ${id}`
      );
      //   await RedisCache.set(id, token);
    } catch (error) {
      ErrorHandler.handleGenericError(
        `Erro ao armazenar token refresh. Erro: `,
        error
      );
      throw new Error(`Erro ao armazenar token refresh. Erro: ${error}`);
    }
  }
  /**
   * Remove o token da tabela de login e do Redis depois insere na tabela de tokens revogados
   * @param token - Token a ser removido
   * @returns - Retorna true se o token foi removido com sucesso, caso contrário, retorna false
   */
  static async removeToken(token: string): Promise<boolean> {
    const deleteQuery = `DELETE FROM ${this.TABLE_LOGIN} WHERE token = $1 RETURNING id, expires_at`;
    const deleteValues = [token];
    try {
      const result = await Database.query(deleteQuery, deleteValues);
      if (result.rows.length > 0) {
        const { id, expires_at } = result.rows[0];
        const insertRevokedQuery = `INSERT INTO ${this.TABLE_REVOKED} (token, expires_at) VALUES ($1, $2)`;
        const insertRevokedValues = [token, expires_at];
        await Database.query(insertRevokedQuery, insertRevokedValues);
        // await RedisCache.del(id);
        AppLogger.getInstance().info(
          `Token removido com sucesso. Token: ${token}`
        );
        return true;
      } else {
        return false;
      }
    } catch (error) {
      ErrorHandler.handleGenericError(`Erro ao remover token. Erro: `, error);
      throw new Error(`Erro ao remover token. Erro: ${error}`);
    }
  }
}
