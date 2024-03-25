import { AppLogger } from "../config/AppLogger";
import { Database } from "../config/Database";
import { TimeRecord as RecordType } from "../interfaces/TimeRecords";
import { QueryResult } from "pg";
import { ErrorHandler } from "../config/ErrorHandler";

/**
 * @class RecordModel
 * @description Classe de modelo que contém os métodos para manipulação de dados de registros de ponto no banco de dados
 */
export class RecordModel {
  private static readonly TABLE_RECORD = "point.time_records";

  /**
   * @description Cria um registro de ponto
   * @param record - Objeto RecordType
   * @returns - Objeto RecordType
   */
  static async create(record: RecordType): Promise<RecordType> {
    const query = `INSERT INTO ${this.TABLE_RECORD} (user_id, record, location) VALUES ($1, $2, $3) RETURNING *`;
    const values = [record.userId, record.record, record.location];
    try {
      const result: QueryResult<any> = await Database.query(query, values);
      const recordFromDb = result.rows[0];
      const newRecord: RecordType = {
        id: recordFromDb.id,
        userId: recordFromDb.user_id,
        record: recordFromDb.record,
        location: recordFromDb.location,
        created_at: recordFromDb.created_at,
      };
      AppLogger.getInstance().info(
        `Registro de ponto criado com sucesso. ID: ${newRecord.id}`
      );
      return newRecord;
    } catch (error: any) {
      let errorMessage = `Erro ao criar registro de ponto. ${error}`;
      AppLogger.getInstance().error(`Erro ao criar registro de ponto. `, error);
      throw new ErrorHandler(error.code, errorMessage);
    }
  }

  /**
   * @description Obtém um registro de ponto por ID
   * @param id - ID do registro
   * @returns - Objeto RecordType ou null se não encontrar
   */
  static async getById(id: string): Promise<RecordType | null> {
    const query = `SELECT * FROM ${this.TABLE_RECORD} WHERE id = $1`;
    const values = [id];
    try {
      const result: QueryResult<any> = await Database.query(query, values);
      const recordFromDb = result.rows.length ? result.rows[0] : null;
      const record: RecordType = {
        id: recordFromDb.id,
        userId: recordFromDb.user_id,
        record: recordFromDb.record,
        location: recordFromDb.location,
        created_at: recordFromDb.created_at,
      };
      AppLogger.getInstance().info(
        `Consulta getById executada com sucesso. ID: ${id}`
      );
      return record;
    } catch (error: any) {
      let errorMessage = `Erro ao buscar registro de ponto. ${error}`;
      AppLogger.getInstance().error(
        `Erro ao buscar registro de ponto por ID. ID: ${id}. `,
        error
      );
      throw new ErrorHandler(error.code, errorMessage);
    }
  }

  /**
   * @description Obtém todos os registros de ponto de um usuário
   * @param userId - ID do usuário
   * @returns - Array de objetos RecordType
   */
  static async getAllByUserId(userId: string): Promise<RecordType[]> {
    const query = `SELECT * FROM ${this.TABLE_RECORD} WHERE user_id = $1`;
    const values = [userId];
    try {
      const result: QueryResult<any> = await Database.query(query, values);
      const recordsFromDb = result.rows;
      const records: RecordType[] = recordsFromDb.map((record: any) => {
        return {
          id: record.id,
          userId: record.user_id,
          record: record.record,
          location: record.location,
          created_at: record.created_at,
        };
      });
      AppLogger.getInstance().info(
        `Consulta getAllByUserId executada com sucesso. ID: ${userId}`
      );
      return records;
    } catch (error: any) {
      let errorMessage = `Erro ao buscar registros de ponto. ${error}`;
      AppLogger.getInstance().error(
        `Erro ao buscar registros de ponto por ID do usuário. ID: ${userId}. `,
        error
      );
      throw new ErrorHandler(error.code, errorMessage);
    }
  }
}
