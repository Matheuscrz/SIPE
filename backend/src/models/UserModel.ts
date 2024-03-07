import { AppLogger } from "../config/AppLogger";
import { Database } from "../config/Database";
import { RedisCache } from "../config/Redis";
import { User as UserType } from "../interfaces/User";
// import { ErrorHandler } from "../config/ErroHandler";
import { QueryResult } from "pg";

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
      const result: QueryResult<any> = await Database.query(query, values); // Fix the type of the result variable
      const user = result.rows.length ? result.rows[0] : null;
      AppLogger.getInstance().info(
        `Consulta getByCpf executada com sucesso. CPF: ${cpf}`
      );
      return user;
    } catch (error) {
      const errorMessage = `Erro ao buscar usuário por CPF. CPF: ${cpf}. Erro: ${error}`;
      // ErrorHandler.handleGenericError(errorMessage);
      throw new Error(errorMessage);
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
      const result: QueryResult<any> = await Database.query(query, values); // Fix the type of the result variable
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
      const errorMessage = `Erro ao buscar usuário por ID. ID: ${id}. Erro: ${error}`;
      // ErrorHandler.handleGenericError(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Adiciona um usuário no banco de dados.
   * @param user - Objeto User
   * @returns - Objeto User inserido no banco de dados
   */
  static async addUser(user: UserType): Promise<UserType | undefined> {
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
    query += ")";

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
        department: result.rows[0].department,
        roles: result.rows[0].roles,
        work_schedule: result.rows[0].work_schedule,
        hiring_date: result.rows[0].hiring_date,
        regime: result.rows[0].regime,
        permission: result.rows[0].permission,
        created_at: result.rows[0].created_at,
        active: result.rows[0].active,
      };
      AppLogger.getInstance().info(
        `Usuário adicionado com sucesso. ID: ${result.rows[0].id}`
      );
      return user;
    } catch (error) {
      const errorMessage = `Erro ao adicionar usuário. CPF: ${user.cpf}. Erro: ${error}`;
      // ErrorHandler.handleGenericError(errorMessage);
      throw new Error(errorMessage);
    }
  }
  /**
   *
   * @param error - Objeto de erro
   */
  private static handleDatabaseError(error: any): void {
    // if (error.code) {
    //   switch (error.code) {
    //     case "23505":
    //       ErrorHandler.handleConflict(
    //         "Já existe um usuário com o mesmo CPF ou PIS."
    //       );
    //       break;
    //     case "23502":
    //       ErrorHandler.handleBadRequest(
    //         "Preencha todos os campos obrigatórios."
    //       );
    //       break;
    //     // Adicione outros casos conforme necessário
    //     default:
    //       ErrorHandler.handleGenericError(
    //         `Erro ao interagir com o banco de dados. Código de erro: ${error.code}. Erro: `,
    //         error
    //       );
    //       break;
    //   }
    // } else {
    //   ErrorHandler.handleGenericError(
    //     `Erro ao interagir com o banco de dados. Erro: `,
    //     error
    //   );
    // }
    throw new Error(`Erro ao interagir com o banco de dados. Erro: ${error}`);
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
      const result: QueryResult<any> = await Database.query(query, values); // Fix the type of the result variable
      AppLogger.getInstance().info(
        `Usuário atualizado com sucesso. ID: ${result.rows[0].id}`
      );
      return result.rows[0];
    } catch (error) {
      // ErrorHandler.handleGenericError(
      //   `Erro ao atualizar usuário. Erro: `,
      //   error
      // );
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
    } catch (error: any) {
      // ErrorHandler.handleGenericError(
      //   `Erro ao remover usuário. ID: ${id}. Erro: `,
      //   error
      // );
      throw new Error(`Erro ao remover usuário. ID: ${id}. Erro: ${error}`);
    }
  }
}
