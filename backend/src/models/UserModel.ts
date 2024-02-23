import { Database } from "../config/Database";
import { RedisCache } from "../config/Redis";
import { User as UserType } from "../interfaces/User";

export default class UserModel {
  private static readonly TABLE_USER = "point.employees";
  private static readonly TABLE_REFRESH_TOKEN = "point.login_tokens";

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
   * Atualiza as informações de login do usuário no banco de dados.
   * @param id - ID do usuário
   * @param loginAttempt - Número de tentativas de login
   */
  static async updateLoginAttempt(
    id: string,
    loginAttempt: number
  ): Promise<void> {
    const query = `UPDATE ${this.TABLE_USER} SET login_attempt = $1 WHERE id = $2`;
    const values = [loginAttempt, id];
    try {
      await Database.query(query, values);
    } catch (error) {
      throw new Error(`Erro ao atualizar tentativa de login: ${error}`);
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
      await RedisCache.setex(id, 604800, refreshToken);
    } catch (error) {
      throw new Error(`Erro ao armazenar token refresh: ${error}`);
    }
  }
}
