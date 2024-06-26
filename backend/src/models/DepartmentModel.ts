import { Department } from "../interfaces/Department";
import { Database } from "../config/Database";
import { QueryResult } from "pg";
import { AppLogger } from "../config/AppLogger";
import { ErrorHandler } from "../error/ErrorHandler";

/**
 * @class DepartmentModel
 * @description Class de modelo que contém os métodos para manipulação de dados de departamentos no banco de dados
 */
export class DepartmentModel {
  private static readonly TABLE_DEPARTMENT = "point.departments";

  /**
   * @param name Nome do departamento
   * @returns Objeto Department
   * @throws {ErrorHandler} Erro ao buscar departamento
   * @description Método para buscar um departamento pelo nome
   */
  static async getDepartmentByName(name: string): Promise<Department> {
    const query = `SELECT * FROM ${this.TABLE_DEPARTMENT} WHERE name = $1`;
    const values = [name];
    try {
      const result: QueryResult<any> = await Database.query(query, values);
      const departmentFromDb = result.rows[0];
      const department: Department = {
        name: departmentFromDb.name,
        responsible: departmentFromDb.responsible,
        created_at: departmentFromDb.created_at,
      };
      AppLogger.getInstance().info(
        `Consulta getDepartmentByName executada com sucesso. Nome: ${name}`
      );
      return department;
    } catch (error: any) {
      let errorMessage = `Erro ao buscar departamento. ${error}`;
      AppLogger.getInstance().error(`Erro ao buscar departamento. `, error);
      throw new ErrorHandler(error.code, errorMessage);
    }
  }

  /**
   * @returns Array de nomes de departamentos
   * @throws {ErrorHandler} Erro ao buscar departamentos
   * @description Método para buscar todos os departamentos e retornar o nome de cada departamento
   */
  static async getAll(): Promise<string[]> {
    const query = `SELECT name FROM ${this.TABLE_DEPARTMENT}`;
    try {
      const result: QueryResult<any> = await Database.query(query);
      const departmentNames: string[] = result.rows.map(
        (departmentFromDb) => departmentFromDb.name
      );
      AppLogger.getInstance().info(`Consulta getAll executada com sucesso.`);
      return departmentNames;
    } catch (error: any) {
      let errorMessage = `Erro ao buscar departamentos. ${error}`;
      AppLogger.getInstance().error(`Erro ao buscar departamentos. `, error);
      throw new ErrorHandler(error.code, errorMessage);
    }
  }

  /**
   * @param name Nome do departamento
   * @returns ID do departamento criado
   * @throws {ErrorHandler} Erro ao criar departamento
   * @description Método para criar um departamento
   */
  static async create(name: string, responsible: string): Promise<string> {
    const query = `INSERT INTO ${this.TABLE_DEPARTMENT} (name, responsible) VALUES ($1, $2) RETURNING name`;
    const values = [name, responsible];
    try {
      const result: QueryResult<any> = await Database.query(query, values);
      AppLogger.getInstance().info(
        `Departamento criado com sucesso. Nome: ${name}`
      );
      return result.rows[0].name;
    } catch (error: any) {
      let errorMessage = `Erro ao criar departamento. ${error}`;
      AppLogger.getInstance().error(`Erro ao criar departamento. `, error);
      throw new ErrorHandler(error.code, errorMessage);
    }
  }
  /**
   * @param id ID do departamento
   * @returns void
   * @throws {ErrorHandler} Erro ao remover departamento
   * @description Método para remover um departamento
   */
  static async remove(name: string): Promise<void> {
    const query = `DELETE FROM ${this.TABLE_DEPARTMENT} WHERE name = $1`;
    const values = [name];
    try {
      await Database.query(query, values);
      AppLogger.getInstance().info(
        `Departamento removido com sucesso. Nome: ${name}`
      );
    } catch (error: any) {
      let errorMessage = `Erro ao remover departamento. ${error}`;
      AppLogger.getInstance().error(`Erro ao remover departamento. `, error);
      throw new ErrorHandler(error.code, errorMessage);
    }
  }
}
