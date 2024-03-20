import { Database } from "../config/Database";
import { AppLogger } from "../config/AppLogger";
import { QueryResult } from "pg";
import { Role as RoleType } from "../interfaces/Role";

/**
 * @class RoleModel
 * @description Class de modelo que contém os métodos para manipulação de dados de cargos no banco de dados
 */
export class RoleModel {
  private static readonly TABLE_ROLE = "point.roles";

  /**
   * Método para buscar um cargo por ID
   * @param id - ID da cargo
   * @returns - Objeto Cargo ou null se não encontrar
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
    } catch (error) {
      let errorMessage = `Erro ao buscar role. ${error}`;
      AppLogger.getInstance().error(
        `Erro ao buscar role por ID. ID: ${id}. `,
        error
      );
      throw errorMessage;
    }
  }

  /**
   * Método para buscar um cargo por nome
   * @param name - Nome da cargo
   * @returns - Objeto Cargo ou null se não encontrar
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
    } catch (error) {
      let errorMessage = `Erro ao buscar role. ${error}`;
      AppLogger.getInstance().error(
        `Erro ao buscar role por nome. Nome: ${name}. `,
        error
      );
      throw errorMessage;
    }
  }

  /**
   * Método para buscar todos os cargos
   * @returns - Array de objetos Cargo
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
    } catch (error) {
      let errorMessage = `Erro ao buscar roles. ${error}`;
      AppLogger.getInstance().error(`Erro ao buscar roles. `, error);
      throw errorMessage;
    }
  }

  /**
   * Método para criar um cargo
   * @param name - Nome do cargo
   * @param description - Descrição do cargo
   * @returns - ID do cargo criado
   */
  static async create(name: string, description: string): Promise<string> {
    const query = `INSERT INTO ${this.TABLE_ROLE} (name, description) VALUES ($1, $2) RETURNING id`;
    const values = [name, description];
    try {
      const result: QueryResult<any> = await Database.query(query, values);
      const id = result.rows[0].id;
      AppLogger.getInstance().info(`Cargo criado com sucesso. ID: ${id}`);
      return id;
    } catch (error) {
      let errorMessage = `Erro ao criar cargo. ${error}`;
      AppLogger.getInstance().error(`Erro ao criar cargo. `, error);
      throw errorMessage;
    }
  }

  /**
   * Método para remover um cargo
   * @param id - ID do cargo
   * @returns - ID do cargo removido
   */
  static async remove(id: string): Promise<boolean> {
    const query = `DELETE FROM ${this.TABLE_ROLE} WHERE id = $1`;
    const values = [id];
    try {
      const result: QueryResult<any> = await Database.query(query, values);
      AppLogger.getInstance().info(`Cargo removido com sucesso. ID: ${id}`);
      return true;
    } catch (error) {
      let errorMessage = `Erro ao remover cargo. ${error}`;
      AppLogger.getInstance().error(`Erro ao remover cargo. `, error);
      throw errorMessage;
    }
  }
}
