import { Database } from "../config/Database";
import { AppLogger } from "../config/AppLogger";
import { QueryResult } from "pg";
import { Role as RoleType } from "../interfaces/Role";
import { ErrorHandler } from "../config/ErrorHandler";

/**
 * @class RoleModel
 * @description Class de modelo que contém os métodos para manipulação de dados de cargos no banco de dados
 */
export class RoleModel {
  private static readonly TABLE_ROLE = "point.roles";

  /**
   * @param id ID da cargo
   * @returns Objeto Cargo ou null se não encontrar
   * @throws {ErrorHandler} Erro ao buscar cargo
   * @description Método para buscar um cargo por ID
   */
  static async getById(id: string): Promise<RoleType | null> {
    const query = `SELECT * FROM ${this.TABLE_ROLE} WHERE id = $1`;
    const values = [id];
    try {
      const result: QueryResult<any> = await Database.query(query, values);
      const roleFromDb = result.rows.length ? result.rows[0] : null;
      const role: RoleType = {
        id: roleFromDb.id,
        name: roleFromDb.name,
        description: roleFromDb.description,
        created_at: roleFromDb.created_at,
      };
      AppLogger.getInstance().info(
        `Consulta getById executada com sucesso. ID: ${id}`
      );
      return role;
    } catch (error: any) {
      let errorMessage = `Erro ao buscar role. ${error}`;
      AppLogger.getInstance().error(
        `Erro ao buscar role por ID. ID: ${id}. `,
        error
      );
      throw new ErrorHandler(error.code, errorMessage);
    }
  }

  /**
   * @param name Nome da cargo
   * @returns Objeto Cargo ou null se não encontrar
   * @throws {ErrorHandler} Erro ao buscar cargo
   * @description Método para buscar um cargo por nome
   */
  static async getByName(name: string): Promise<RoleType | null> {
    const query = `SELECT * FROM ${this.TABLE_ROLE} WHERE name = $1`;
    const values = [name];
    try {
      const result: QueryResult<any> = await Database.query(query, values);
      const roleFromDb = result.rows.length ? result.rows[0] : null;
      const role: RoleType = {
        id: roleFromDb.id,
        name: roleFromDb.name,
        description: roleFromDb.description,
        created_at: roleFromDb.created_at,
      };
      AppLogger.getInstance().info(
        `Consulta getByName executada com sucesso. Nome: ${name}`
      );
      return role;
    } catch (error: any) {
      let errorMessage = `Erro ao buscar role. ${error}`;
      AppLogger.getInstance().error(
        `Erro ao buscar role por nome. Nome: ${name}. `,
        error
      );
      throw new ErrorHandler(error.code, errorMessage);
    }
  }

  /**
   * @returns Array de objetos Cargo
   * @throws {ErrorHandler} Erro ao buscar cargos
   * @description Método para buscar todos os cargos
   */
  static async getAll(): Promise<RoleType[]> {
    const query = `SELECT * FROM ${this.TABLE_ROLE}`;
    try {
      const result: QueryResult<any> = await Database.query(query);
      const roles: RoleType[] = result.rows.map((roleFromDb) => {
        return {
          id: roleFromDb.id,
          name: roleFromDb.name,
          description: roleFromDb.description,
          created_at: roleFromDb.created_at,
        };
      });
      AppLogger.getInstance().info(`Consulta getAll executada com sucesso.`);
      return roles;
    } catch (error: any) {
      let errorMessage = `Erro ao buscar roles. ${error}`;
      AppLogger.getInstance().error(`Erro ao buscar roles. `, error);
      throw new ErrorHandler(error.code, errorMessage);
    }
  }

  /**
   * @param name Nome do cargo
   * @param description Descrição do cargo
   * @returns ID do cargo criado
   * @throws {ErrorHandler} Erro ao criar cargo
   * @description Método para criar um cargo
   */
  static async create(name: string, description: string): Promise<string> {
    const query = `INSERT INTO ${this.TABLE_ROLE} (name, description) VALUES ($1, $2) RETURNING id`;
    const values = [name, description];
    try {
      const result: QueryResult<any> = await Database.query(query, values);
      const id = result.rows[0].id;
      AppLogger.getInstance().info(`Cargo criado com sucesso. ID: ${id}`);
      return id;
    } catch (error: any) {
      let errorMessage = `Erro ao criar cargo. ${error}`;
      AppLogger.getInstance().error(`Erro ao criar cargo. `, error);
      throw new ErrorHandler(error.code, errorMessage);
    }
  }

  /**
   * @param id ID do cargo
   * @returns ID do cargo removido
   * @throws {ErrorHandler} Erro ao remover cargo
   * @description Método para remover um cargo
   */
  static async remove(id: string): Promise<boolean> {
    const query = `DELETE FROM ${this.TABLE_ROLE} WHERE id = $1`;
    const values = [id];
    try {
      const result: QueryResult<any> = await Database.query(query, values);
      AppLogger.getInstance().info(`Cargo removido com sucesso. ID: ${id}`);
      return true;
    } catch (error: any) {
      let errorMessage = `Erro ao remover cargo. ${error}`;
      AppLogger.getInstance().error(`Erro ao remover cargo. `, error);
      throw new ErrorHandler(error.code, errorMessage);
    }
  }
}
