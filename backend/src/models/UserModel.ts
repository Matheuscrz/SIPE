import { Database } from "../config/Database";
import { RedisCache } from "../config/Redis";
import { User as UserType } from "../interfaces/User";

export default class UserModel {
  private static readonly TABLE_USER = "point.employees";
  private static readonly TABLE_REFRESH_TOKEN = "point.login_tokens";
  private static readonly TABLE_REVOKED_TOKEN = "point.revoked_tokens";

  /**
   * Obtém um usuário por meio do CPF
   * @param cpf - CPF do usuário
   * @returns Objeto User ou null se não encontrar
   */
  static async getByCpf(cpf: string): Promise<UserType | null> {
    const query = `SELECT * FROM ${this.TABLE_USER} WHERE cpf = $1`;
    const values = [cpf];
    try {
      const result = await Database.query(query, values);
      const user = result.rows.length ? result.rows[0] : null;
      return user;
    } catch (error) {
      throw new Error(`Erro ao buscar usuário por CPF: ${error}`);
    }
  }

  /**
   * Armazena o token refresh no banco de dados e no cache.
   * @param id - ID do usuário
   * @param refreshToken - Token refresh
   * @param expiresAt - Data de expiração do token
   */
  static async storeRefreshToken(
    id: string,
    refreshToken: string,
    expiresAt: Date
  ): Promise<void> {
    const query = `INSERT INTO ${this.TABLE_REFRESH_TOKEN} (user_id, token, expires_at) VALUES ($1, $2, $3)`;
    const values = [id, refreshToken, expiresAt];
    try {
      await Database.query(query, values);
      await RedisCache.set(id, refreshToken);
    } catch (error) {
      throw new Error(`Erro ao armazenar token refresh: ${error}`);
    }
  }

  /**
   *  Armazena o token de acesso no cache.
   * @param id - ID do usuário
   * @param accessToken - Token de acesso
   * @param expiresAt - Data de expiração do token
   */
  static async storeAccessToken(
    id: string,
    accessToken: string
  ): Promise<void> {
    try {
      await RedisCache.set(id, accessToken);
    } catch (error) {
      throw new Error(`Erro ao armazenar token de acesso: ${error}`);
    }
  }

  /**
   * Remove o token refresh do banco de dados e do cache.
   * @param refreshToken - Token refresh
   * @returns True se o token foi removido, false se não encontrou
   */
  static async removeRefreshToken(refreshToken: string): Promise<boolean> {
    const deleteQuery = `DELETE FROM ${this.TABLE_REFRESH_TOKEN} WHERE refresh_token = $1 RETURNING id, expires_at`;
    const values = [refreshToken];
    try {
      const result = await Database.query(deleteQuery, values);
      if (result.rows.length > 0) {
        const { id, expires_at } = result.rows[0];
        const insertRevokedQuery = `INSERT INTO ${this.TABLE_REVOKED_TOKEN} (id, token, expires_at) VALUES ($1, $2, $3)`;
        const revokedTokenValues = [id, refreshToken, expires_at];
        await Database.query(insertRevokedQuery, revokedTokenValues);
        await RedisCache.del(id);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      throw new Error(`Erro ao remover token refresh: ${error}`);
    }
  }
}
