import { AppLogger } from "../config/AppLogger";
import { Database } from "../config/Database";
/**
 * @class TokenModel
 * @description Classe de modelo para tokens
 */
export class TokenModel {
  private static readonly TABLE_LOGIN = "point.login_tokens";

  /**
   * Armazena um token refresh
   * @param {string} id - ID do usuário
   * @param {string} token - Token refresh
   * @param {Date} expiresAt - Data de expiração do token
   */
  static async storeToken(
    id: string,
    token: string,
    expiresAt: Date
  ): Promise<void> {
    const query = `INSERT INTO ${this.TABLE_LOGIN} (id, token, expires_at) VALUES ($1, $2, $3)`;
    const values = [id, token, expiresAt];
    try {
      await Database.query(query, values);
      AppLogger.getInstance().info(
        `Token refresh armazenado com sucesso. ID: ${id}`
      );
    } catch (error) {
      let erroMessage = `Erro ao armazenar token. ${error}`;
      AppLogger.getInstance().error(
        `Erro ao armazenar token refresh. ID: ${id}. `,
        error
      );
      throw erroMessage;
    }
  }

  /**
   * Remove um token refresh
   * @param {string} token - Token refresh
   * @returns {boolean} Retorna true se o token foi removido com sucesso, caso contrário, retorna false
   */
  static async removeToken(token: string): Promise<boolean> {
    const deleteQuery = `DELETE FROM ${this.TABLE_LOGIN} WHERE token = $1`;
    const deleteValues = [token];
    try {
      await Database.query(deleteQuery, deleteValues);
      AppLogger.getInstance().info(
        `Token removido com sucesso. Token: ${token}`
      );
      return true;
    } catch (error) {
      let errorMessage = `Erro ao remover token. ${error}`;
      AppLogger.getInstance().error(
        `Erro ao remover token. Token: ${token}. `,
        error
      );
      throw errorMessage;
    }
  }
}
