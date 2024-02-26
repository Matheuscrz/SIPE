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
   * Obtém um usuário por meio do ID
   * @param id - ID do usuário
   * @returns - Objeto User ou null se não encontrar
   */
  static async getById(id: string): Promise<UserType | null> {
    const query = `SELECT * FROM ${this.TABLE_USER} WHERE id = $1`;
    const values = [id];
    try {
      const result = await Database.query(query, values);
      const user = result.rows.length ? result.rows[0] : null;
      return user;
    } catch (error) {
      throw new Error(`Erro ao buscar usuário por ID: ${error}`);
    }
  }

  /**
   * Adiciona um usuário no banco de dados.
   * @param user - Objeto User
   * @returns - Objeto User inserido no banco de dados
   */
  static async addUser(user: UserType): Promise<UserType> {
    const query = `INSERT INTO ${this.TABLE_USER} (name, password, cpf, pis, pin, gender, birth_date, department_id, roles_id, work_schedule_id, hiring_date, regime) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`;
    const values = [
      user.personalData.name,
      user.personalData.password,
      user.personalData.cpf,
      user.personalData.pis,
      user.personalData.pin,
      user.personalData.gender,
      user.personalData.birthDate,
      user.employmentData.departmentId,
      user.employmentData.roleId,
      user.employmentData.workScheduleId,
      user.employmentData.hiringDate,
      user.employmentData.regime,
    ];
    try {
      const result = await Database.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao adicionar usuário: ${error}`);
    }
  }

  /**
   * Atualiza um usuário no banco de dados.
   * @param user - Objeto User
   * @returns - Objeto User atualizado no banco de dados
   */
  static async updateUser(user: UserType): Promise<UserType> {
    const query = `UPDATE ${this.TABLE_USER} SET password = COALESCE($1, password), pin = COALESCE($2, pin), department_id = COALESCE($3, department_id), roles_id = COALESCE($4, roles_id), work_schedule_id = COALESCE($5, work_schedule_id), hiring_date = COALESCE($6, hiring_date), regime = COALESCE($7, regime) WHERE id = $8 RETURNING *`;
    const values = [
      user.personalData.password ? user.personalData.password : null,
      user.personalData.pin ? user.personalData.pin : null,
      user.employmentData.departmentId
        ? user.employmentData.departmentId
        : null,
      user.employmentData.roleId ? user.employmentData.roleId : null,
      user.employmentData.workScheduleId
        ? user.employmentData.workScheduleId
        : null,
      user.employmentData.hiringDate ? user.employmentData.hiringDate : null,
      user.employmentData.regime ? user.employmentData.regime : null,
    ];
    try {
      const result = await Database.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao atualizar usuário: ${error}`);
    }
  }

  /**
   * Remove um usuário do banco de dados.
   * @param id - ID do usuário
   * @returns - Objeto User removido do banco de dados
   */
  static async removeUser(id: string): Promise<void> {
    const query = `DELETE FROM ${this.TABLE_USER} WHERE id = $1`;
    const values = [id];
    try {
      await Database.query(query, values);
    } catch (error) {
      throw new Error(`Erro ao remover usuário: ${error}`);
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
