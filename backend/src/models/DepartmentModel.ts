import { Department } from "../interfaces/Department";
import { Database } from "../config/Database";
import { QueryResult } from "pg";
import { AppLogger } from "../config/AppLogger";

/**
 * Modelo de departamento
 * @class DepartmentModel
 */
export class DepartmentModel {
  private static readonly TABLE_DEPARTMENT = "point.departments";

  /**
   * Método para buscar um departamento por nome
   * @param name - Nome do departamento
   * @returns - Objeto Department ou null se não encontrar
   */
  static async getByName(name: string): Promise<Department | null> {
    const query = `SELECT * FROM ${this.TABLE_DEPARTMENT} WHERE name = $1`;
    const values = [name];
    try {
      const result: QueryResult<any> = await Database.query(query, values);
      const departmentFromDb = result.rows.length ? result.rows[0] : null;
      const department: Department = {
        name: departmentFromDb.name,
        responsible: departmentFromDb.responsible,
        created_at: departmentFromDb.created_at,
      };
      AppLogger.getInstance().info(
        `Consulta getByName executada com sucesso. Nome: ${name}`
      );
      return department;
    } catch (error) {
      let errorMessage = `Erro ao buscar departamento. ${error}`;
      AppLogger.getInstance().error(
        `Erro ao buscar departamento por nome. Nome: ${name}. `,
        error
      );
      throw errorMessage;
    }
  }

  /**
   * Método para buscar todos os departamentos
   * @returns - Array de objetos Department
   */
  static async getAll(): Promise<Department[]> {
    const query = `SELECT * FROM ${this.TABLE_DEPARTMENT}`;
    try {
      const result: QueryResult<any> = await Database.query(query);
      const departments: Department[] = result.rows.map((departmentFromDb) => {
        return {
          id: departmentFromDb.id,
          name: departmentFromDb.name,
          responsible: departmentFromDb.responsible,
          created_at: departmentFromDb.created_at,
        };
      });
      AppLogger.getInstance().info(`Consulta getAll executada com sucesso.`);
      return departments;
    } catch (error) {
      let errorMessage = `Erro ao buscar departamentos. ${error}`;
      AppLogger.getInstance().error(`Erro ao buscar departamentos. `, error);
      throw errorMessage;
    }
  }

  /**
   * Método para criar um departamento
   * @param name - Nome do departamento
   * @returns - ID do departamento criado
   */
  static async create(name: string, responsible: string): Promise<string> {
    const query = `INSERT INTO ${this.TABLE_DEPARTMENT} (name, responsible) VALUES ($1, $2) RETURNING id`;
    const values = [name, responsible];
    try {
      const result: QueryResult<any> = await Database.query(query, values);
      AppLogger.getInstance().info(
        `Departamento criado com sucesso. Nome: ${name}`
      );
      return result.rows[0].name;
    } catch (error) {
      let errorMessage = `Erro ao criar departamento. ${error}`;
      AppLogger.getInstance().error(`Erro ao criar departamento. `, error);
      throw errorMessage;
    }
  }
  /**
   * Método para remover um departamento
   * @param id - ID do departamento
   */
  static async remove(name: string): Promise<void> {
    const query = `DELETE FROM ${this.TABLE_DEPARTMENT} WHERE name = $1`;
    const values = [name];
    try {
      await Database.query(query, values);
      AppLogger.getInstance().info(
        `Departamento removido com sucesso. Nome: ${name}`
      );
    } catch (error) {
      let errorMessage = `Erro ao remover departamento. ${error}`;
      AppLogger.getInstance().error(`Erro ao remover departamento. `, error);
      throw errorMessage;
    }
  }
}
