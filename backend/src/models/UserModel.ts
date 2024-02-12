import { Database } from "../config/Database";
import { User } from "../interfaces/User";

export class UserModel {
  private static readonly TABLE_NAME = "point.employees";

  /**
   * Obtém um usuário pelo CPF.
   * @param cpf - CPF do usuário.
   * @returns Objeto User ou null se o usuário não for encontrado.
   */
  static async getUserByCpf(cpf: string): Promise<User | null> {
    const query = `SELECT * FROM point.employees WHERE cpf = $1`;
    const values = [cpf];
    try {
      const client = await Database.getPool().connect();
      const result = await client.query(query, values);
      const user = result.rows.length ? result.rows[0] : null;
      client.release();
      return user;
    } catch (error) {
      throw new Error(
        `Erro ao buscar usuário por CPF: ${(error as Error).message}`
      );
    }
  }

  /**
   * Atualiza as informações de login do usuário no banco de dados.
   * @param userId - ID do usuário.
   * @param loginAttempts - Número de tentativas de login.
   * @returns Promise<void>
   */
  static async updateLoginAttempts(
    userId: number,
    loginAttempts: number
  ): Promise<void> {
    const query = `UPDATE ${this.TABLE_NAME} SET login_attempts = $1 WHERE id = $2`;
    const values = [loginAttempts, userId];
    try {
      await Database.query(query, values);
    } catch (error) {
      throw new Error(
        `Erro ao buscar usuário por CPF: ${(error as Error).message}`
      );
    }
  }

  /**
   * Armazena o token de refresh no banco de dados.
   * @param userId - ID do usuário.
   * @param refreshToken - Token de refresh.
   * @param expiresAt - Data de expiração do token de refresh.
   * @returns Promise<void>
   */
  static async storeRefreshToken(
    userId: string,
    refreshToken: string,
    expiresAt: Date
  ): Promise<void> {
    const query =
      "INSERT INTO login_tokens (user_id, refresh_token, expires_at) VALUES ($1, $2, $3)";
    const values = [userId, refreshToken, expiresAt];
    try {
      await Database.query(query, values);
    } catch (error) {
      throw new Error(
        `Erro ao buscar usuário por CPF: ${(error as Error).message}`
      );
    }
  }
}
