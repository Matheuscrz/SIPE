import { AppLogger } from "../config/AppLogger";
import { Database } from "../config/Database";
import { User as UserType } from "../interfaces/User";
import { QueryResult } from "pg";
import { ErrorHandler } from "../config/ErrorHandler";

/**
 * @class UserModel
 * @description Classe de modelo que contém os métodos para manipulação de dados de usuários no banco de dados
 */
export class UserModel {
  private static readonly TABLE_USER = "point.employees";
  /**
   * @param cpf CPF do usuário
   * @returns Objeto User ou null se não encontrar
   * @throws {ErrorHandler} Erro ao buscar usuário
   * @description Método para buscar um usuário por CPF
   */

  static async getByCpf(cpf: string): Promise<UserType | null> {
    const query = `SELECT * FROM ${this.TABLE_USER} WHERE cpf = $1`;
    const values = [cpf];
    try {
      const result: QueryResult<any> = await Database.query(query, values);
      const user = result.rows.length ? result.rows[0] : null;
      AppLogger.getInstance().info(
        `Consulta getByCpf executada com sucesso. CPF: ${cpf}`
      );
      return user;
    } catch (error: any) {
      let errorMessage = `Erro ao buscar usuário. ${error}`;
      AppLogger.getInstance().error(
        `Erro ao buscar usuário por CPF. CPF: ${cpf}. `,
        error
      );
      throw new ErrorHandler(error.code, errorMessage);
    }
  }

  /**
   * @param id ID do usuário
   * @returns Objeto User ou null se não encontrar
   * @throws {ErrorHandler} Erro ao buscar usuário
   * @description Método para buscar um usuário por ID
   */
  static async getById(id: string): Promise<UserType | null> {
    const query = `SELECT * FROM ${this.TABLE_USER} WHERE id = $1`;
    const values = [id];
    try {
      const result: QueryResult<any> = await Database.query(query, values);
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
        role_id: userFromDb.role_id,
        work_schedule: userFromDb.work_schedule,
        hiring_date: userFromDb.hiring_date,
        permission: userFromDb.permission,
        active: userFromDb.active,
        created_at: userFromDb.created_at,
      };
      AppLogger.getInstance().info(
        `Consulta getById executada com sucesso. ID: ${id}`
      );
      return user;
    } catch (error: any) {
      let errorMessage = `Erro ao buscar usuário. ${error}`;
      AppLogger.getInstance().error(
        `Erro ao buscar usuário por ID. ID: ${id}. `,
        error
      );
      throw new ErrorHandler(error.code, errorMessage);
    }
  }

  /**
   * @param user Objeto User
   * @returns Objeto User inserido no banco de dados
   * @throws {ErrorHandler} Erro ao adicionar usuário
   * @description Método para adicionar um usuário
   */
  static async addUser(user: UserType): Promise<UserType | undefined> {
    let query = `INSERT INTO ${this.TABLE_USER} (name, password, cpf, pis, pin, gender, birth_date, role_id, work_schedule, hiring_date`;
    let values = [
      user.name,
      user.password,
      user.cpf,
      user.pis,
      user.pin,
      user.gender,
      user.birth_date,
      user.role_id,
      user.work_schedule,
      user.hiring_date,
    ];
    if (user.permission) {
      query += ", permission";
      values.push(user.permission);
    }

    query += ") VALUES (";
    for (let i = 1; i <= values.length; i++) {
      query += `$${i}`;
      if (i < values.length) {
        query += ",";
      }
    }
    query += ") RETURNING *";
    try {
      const result = await Database.query(query, values);
      const user: UserType = {
        id: result.rows[0].id,
        name: result.rows[0].name,
        password: result.rows[0].password,
        cpf: result.rows[0].cpf,
        pis: result.rows[0].pis,
        pin: result.rows[0].pin,
        gender: result.rows[0].gender,
        birth_date: result.rows[0].birth_date,
        role_id: result.rows[0].role_id,
        work_schedule: result.rows[0].work_schedule,
        hiring_date: result.rows[0].hiring_date,
        permission: result.rows[0].permission,
        active: result.rows[0].active,
        created_at: result.rows[0].created_at,
      };
      AppLogger.getInstance().info(
        `Usuário adicionado com sucesso. ID: ${result.rows[0].id}`
      );
      return user;
    } catch (error: any) {
      let errorMessage = `Erro ao adicionar usuário. ${error}`;
      AppLogger.getInstance().error(
        `Erro ao adicionar usuário. CPF: ${user.cpf}. `,
        error
      );
      throw new ErrorHandler(error.code, errorMessage);
    }
  }

  /**
   * @param user Objeto User
   * @returns Objeto User atualizado no banco de dados
   * @throws {ErrorHandler} Erro ao atualizar usuário
   * @description Método para atualizar um usuário
   */
  static async updateUser(user: UserType): Promise<UserType | null> {
    const query = `UPDATE ${this.TABLE_USER} SET password = COALESCE($1, password), pin = COALESCE($2, pin), role_id = COALESCE($4, roles), work_schedule = COALESCE($5, work_schedule), hiring_date = COALESCE($6, hiring_date) WHERE id = $7 RETURNING *`;
    const values = [
      user.password,
      user.pin,
      user.department,
      user.roles,
      user.work_schedule,
      user.hiring_date,
      user.id,
    ];
    try {
      const result: QueryResult<any> = await Database.query(query, values); // Fix the type of the result variable
      AppLogger.getInstance().info(
        `Usuário atualizado com sucesso. ID: ${result.rows[0].id}`
      );
      return result.rows[0];
    } catch (error: any) {
      let errorMessage = `Erro ao atualizar usuário. ${error}`;
      AppLogger.getInstance().error(
        `Erro ao atualizar usuário. ID: ${user.id}. `,
        error
      );
      throw new ErrorHandler(error.code, errorMessage);
    }
  }

  /**
   * @param id ID do usuário
   * @returns Objeto User removido do banco de dados
   * @throws {ErrorHandler} Erro ao remover usuário
   * @description Método para remover um usuário
   */
  static async removeUser(id: string): Promise<void> {
    const query = `DELETE FROM ${this.TABLE_USER} WHERE id = $1`;
    const values = [id];
    try {
      await Database.query(query, values);
      AppLogger.getInstance().info(`Usuário removido com sucesso. ID: ${id}`);
    } catch (error: any) {
      let errorMessage = `Erro ao remover usuário. ${error}`;
      AppLogger.getInstance().error(
        `Erro ao remover usuário. ID: ${id}. `,
        error
      );
      throw new ErrorHandler(error.code, errorMessage);
    }
  }
}
