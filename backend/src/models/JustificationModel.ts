import { AppLogger } from "../config/AppLogger";
import { Database } from "../config/Database";
import { Justification } from "../interfaces/Justification";
import { QueryResult } from "pg";
import { ErrorHandler } from "../config/ErrorHandler";

/**
 * @class JustificationModel
 * @description Classe de modelo que contém os métodos para manipulação de dados de justificativas no banco de dados
 */
export class JustificationModel {
  private static readonly TABLE_JUSTIFICATION = "point.justifications";
  private static readonly TABLE_JUSTIFICATION_RECORD =
    "point.justification_time_records";

  /**
   * @param justification Justificativa
   * @returns Objeto Justification
   * @throws {ErrorHandler} Erro ao criar justificativa
   * @description Método para criar uma justificativa
   */
  static async create(justification: Justification): Promise<Justification> {
    const query = `INSERT INTO ${this.TABLE_JUSTIFICATION} (user_id, justification, justification_date) VALUES ($1, $2, $3) RETURNING *`;
    const values = [
      justification.userId,
      justification.justification,
      justification.justification_date,
    ];
    try {
      const result: QueryResult<any> = await Database.query(query, values);
      const justificationFromDb = result.rows[0];
      const justification: Justification = {
        id: justificationFromDb.id,
        userId: justificationFromDb.user_id,
        justification: justificationFromDb.justification,
        justification_date: justificationFromDb.justification_date,
        created_at: justificationFromDb.created_at,
      };
      AppLogger.getInstance().info(
        `Justificativa criada com sucesso. ID: ${justification.id}`
      );
      return justification;
    } catch (error: any) {
      let errorMessage = `Erro ao criar justificativa. ${error}`;
      AppLogger.getInstance().error(`Erro ao criar justificativa. `, error);
      throw new ErrorHandler(error.code, errorMessage);
    }
  }
}
