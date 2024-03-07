import { AppLogger } from "../config/AppLogger";
import { Database } from "../config/Database";
import { RedisCache } from "../config/Redis";
import { User as UserType } from "../interfaces/User";
import { ErrorHandler } from "../config/ErroHandler";

export class UserModel {
  private static readonly TABLE_USER = "point.employees";
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
      AppLogger.getInstance().info(
        `Consulta getByCpf executada com sucesso. CPF: ${cpf}`
      );
      return user;
    } catch (error) {
      ErrorHandler.handleGenericError(
        `Erro ao buscar usuário por CPF. CPF: ${cpf}. Error: `,
        error
      );
      throw new Error(
        `Erro ao buscar usuário por CPF. CPF: ${cpf}. Error: ${error}`
      );
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
      const userFromDb = result.rows.length ? result.rows[0] : null;
      const user: UserType = {
        id: userFromDb.id,
        name: userFromDb.name,
        password: userFromDb.password,
        cpf: userFromDb.cpf,
        pis: userFromDb.pis,
        pin: userFromDb.pin,
        gender: userFromDb.gender,
        birth_date: userFromDb.birth_date,
        department: userFromDb.department,
        roles: userFromDb.roles,
        work_schedule: userFromDb.work_schedule,
        hiring_date: userFromDb.hiring_date,
        regime: userFromDb.regime,
        permission: userFromDb.permission,
        created_at: userFromDb.created_at,
        active: userFromDb.active,
      };
      AppLogger.getInstance().info(
        `Consulta getById executada com sucesso. ID: ${id}`
      );
      return user;
    } catch (error) {
      ErrorHandler.handleGenericError(`Erro ao buscar usuário. Error: `, error);
      throw new Error(`Erro ao buscar usuário. Error: ${error}`);
    }
  }

  /**
   * Adiciona um usuário no banco de dados.
   * @param user - Objeto User
   * @returns - Objeto User inserido no banco de dados
   */
  static async addUser(user: UserType): Promise<UserType> {
    let query = `INSERT INTO ${this.TABLE_USER} (name, password, cpf, pis, pin, gender, birth_date, department, roles, work_schedule, hiring_date, regime`;
    let values = [
      user.name,
      user.password,
      user.cpf,
      user.pis,
      user.pin,
      user.gender,
      user.birth_date,
      user.department,
      user.roles,
      user.work_schedule,
      user.hiring_date,
      user.regime,
    ];
    // Adiciona a coluna `permission` à query e valores apenas se o ID de permissão for fornecido
    if (user.permission) {
      query += ", permission";
      values.push(user.permission);
    }
    query += ") VALUES (";
    for (let i = 1; i <= values.length; i++) {
      query += `$${i}`;
      if (i < values.length) {
        query += ", ";
      }
    }
    query += ") RETURNING *";
    try {
      const result = await Database.query(query, values);
      AppLogger.getInstance().info(
        `Usuário adicionado com sucesso. ID: ${result.rows[0].id}`
      );
      return result.rows[0];
    } catch (error) {
      ErrorHandler.handleGenericError(
        `Erro ao adicionar usuário. Erro: `,
        error
      );
      throw new Error(`Erro ao adicionar usuário. Erro: ${error}`);
    }
  }

  /**
   * Atualiza um usuário no banco de dados.
   * @param user - Objeto User
   * @returns - Objeto User atualizado no banco de dados
   */
  static async updateUser(user: UserType): Promise<UserType> {
    const query = `UPDATE ${this.TABLE_USER} SET password = COALESCE($1, password), pin = COALESCE($2, pin), department = COALESCE($3, department), roles = COALESCE($4, roles), work_schedule = COALESCE($5, work_schedule), hiring_date = COALESCE($6, hiring_date), regime = COALESCE($7, regime) WHERE id = $8 RETURNING *`;
    const values = [
      user.password,
      user.pin,
      user.department,
      user.roles,
      user.work_schedule,
      user.hiring_date,
      user.regime,
      user.id,
    ];
    try {
      const result = await Database.query(query, values);
      AppLogger.getInstance().info(
        `Usuário atualizado com sucesso. ID: ${result.rows[0].id}`
      );
      return result.rows[0];
    } catch (error) {
      ErrorHandler.handleGenericError(
        `Erro ao atualizar usuário. Erro: `,
        error
      );
      throw new Error(`Erro ao atualizar usuário. Erro: ${error}`);
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
      AppLogger.getInstance().info(`Usuário removido com sucesso. ID: ${id}`);
    } catch (error) {
      ErrorHandler.handleGenericError(
        `Erro ao remover usuário. ID: ${id}. Erro: `,
        error
      );
      throw new Error(`Erro ao remover usuário. ID: ${id}. Erro: ${error}`);
    }
  }
}
