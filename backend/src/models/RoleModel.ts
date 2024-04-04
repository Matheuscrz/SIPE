import { Database } from "../config/Database";
import { AppLogger } from "../config/AppLogger";
import { QueryResult } from "pg";
import { Role, Role as RoleType } from "../interfaces/Role";
import { ErrorHandler } from "../error/ErrorHandler";

/**
 * @class RoleModel
 * @description Class de modelo que contém os métodos para manipulação de dados de cargos no banco de dados
 */
export class RoleModel {
  private static readonly TABLE_ROLE = "point.roles";

  /**
   * @returns Array de nomes de cargos
   * @throws {ErrorHandler} Erro ao buscar cargos
   * @description Método para buscar todos os cargos
   */
  static async getAll(): Promise<string[]> {
    const query = `SELECT * FROM ${this.TABLE_ROLE}`;
    try {
      const result: QueryResult<any> = await Database.query(query);
      const roles: string[] = result.rows.map(
        (rolesFromDb) => rolesFromDb.name
      );
      AppLogger.getInstance().info(`Consulta getAll executada com sucesso.`);
      return roles;
    } catch (error: any) {
      let errorMessage = `Erro ao buscar roles. ${error}`;
      AppLogger.getInstance().error(`Erro ao buscar roles. `, error);
      throw new ErrorHandler(error.code, errorMessage);
    }
  }

  /**
   * @param role Entidade de cargo
   * @returns Nome do cargo criado
   * @throws {ErrorHandler} Erro ao criar cargo
   * @description Método para criar um cargo
   */
  static async create(role: Role): Promise<string> {
    const query = `INSERT INTO ${this.TABLE_ROLE} (name, description) VALUES ($1, $2) RETURNING name`;
    const values = [role.name, role.description];
    try {
      const result: QueryResult<any> = await Database.query(query, values);
      AppLogger.getInstance().info(
        `Cargo criado com sucesso. Nome: ${role.name}`
      );
      return result.rows[0].name;
    } catch (error: any) {
      let errorMessage = `Erro ao criar cargo. ${error}`;
      AppLogger.getInstance().error(`Erro ao criar cargo. `, error);
      throw new ErrorHandler(error.code, errorMessage);
    }
  }

  /**
   * @param name Nome do cargo
   * @returns True se o cargo foi removido com sucesso
   * @throws {ErrorHandler} Erro ao remover cargo
   * @description Método para remover um cargo
   */
  static async remove(name: string): Promise<boolean> {
    const query = `DELETE FROM ${this.TABLE_ROLE} WHERE name = $1`;
    const values = [name];
    try {
      const result: QueryResult<any> = await Database.query(query, values);
      AppLogger.getInstance().info(`Cargo removido com sucesso. Nome: ${name}`);
      return true;
    } catch (error: any) {
      let errorMessage = `Erro ao remover cargo. ${error}`;
      AppLogger.getInstance().error(`Erro ao remover cargo. `, error);
      throw new ErrorHandler(error.code, errorMessage);
    }
  }
}
