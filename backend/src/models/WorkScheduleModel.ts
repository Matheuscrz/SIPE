import { AppLogger } from "../config/AppLogger";
import { Database } from "../config/Database";
import { WorkSchedule as WorkScheduleType } from "../interfaces/WorkSchedule";
import { QueryResult } from "pg";
import { ErrorHandler } from "../error/ErrorHandler";

/**
 * @class WorkScheduleModel
 * @description Classe de modelo que contém os métodos para manipulação de dados de horários de trabalho no banco de dados
 */
export class WorkScheduleModel {
  private static readonly TABLE_WORK_SCHEDULE = "point.work_schedules";
  /**
   * @param name Nome do horário de trabalho
   * @returns Objeto WorkSchedule ou null se não encontrar
   * @throws {ErrorHandler} Erro ao buscar horário de trabalho
   * @description Método para buscar um horário de trabalho por nome
   */
  static async getByName(name: string): Promise<WorkScheduleType | null> {
    const query = `SELECT * FROM ${this.TABLE_WORK_SCHEDULE} WHERE name = $1`;
    const values = [name];
    try {
      const result: QueryResult<any> = await Database.query(query, values);
      const workSchedule = result.rows.length ? result.rows[0] : null;
      AppLogger.getInstance().info(
        `Consulta getByName executada com sucesso. Nome: ${name}`
      );
      return workSchedule;
    } catch (error: any) {
      let errorMessage = `Erro ao buscar horário de trabalho. ${error}`;
      AppLogger.getInstance().error(
        `Erro ao buscar horário de trabalho por nome. Nome: ${name}. `,
        error
      );
      throw new ErrorHandler(error.code, errorMessage);
    }
  }

  /**
   * @param workSchedule Objeto WorkSchedule
   * @returns Objeto WorkSchedule inserido
   * @throws {ErrorHandler} Erro ao inserir horário de trabalho
   * @description Método para adicionar um novo horário de trabalho
   */
  static async add(workSchedule: WorkScheduleType): Promise<WorkScheduleType> {
    const query = `INSERT INTO ${this.TABLE_WORK_SCHEDULE} (name, start_time, end_time, lunch_duration, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const values = [
      workSchedule.name,
      workSchedule.start_time,
      workSchedule.end_time,
      workSchedule.lunch_duration,
      workSchedule.created_at,
    ];
    try {
      const result: QueryResult<any> = await Database.query(query, values);
      const workScheduleFromDb = result.rows.length ? result.rows[0] : null;
      const workSchedule: WorkScheduleType = {
        name: workScheduleFromDb.name,
        start_time: workScheduleFromDb.start_time,
        end_time: workScheduleFromDb.end_time,
        lunch_duration: workScheduleFromDb.lunch_duration,
        created_at: workScheduleFromDb.created_at,
      };
      AppLogger.getInstance().info(
        `Inserção de horário de trabalho executada com sucesso. Nome: ${workSchedule.name}`
      );
      return workSchedule;
    } catch (error: any) {
      let errorMessage = `Erro ao inserir horário de trabalho. ${error}`;
      AppLogger.getInstance().error(
        `Erro ao inserir horário de trabalho. Nome: ${workSchedule.name}. `,
        error
      );
      throw new ErrorHandler(error.code, errorMessage);
    }
  }

  /**
   * @param name Nome do horário de trabalho
   * @returns void
   * @throws {ErrorHandler} Erro ao remover horário de trabalho
   * @description Método para remover um horário de trabalho por nome
   */
  static async removeByName(name: string): Promise<void> {
    const query = `DELETE FROM ${this.TABLE_WORK_SCHEDULE} WHERE name = $1`;
    const values = [name];
    try {
      await Database.query(query, values);
      AppLogger.getInstance().info(
        `Remoção de horário de trabalho executada com sucesso. Nome: ${name}`
      );
    } catch (error: any) {
      let errorMessage = `Erro ao remover horário de trabalho. ${error}`;
      AppLogger.getInstance().error(
        `Erro ao remover horário de trabalho por nome. Nome: ${name}. `,
        error
      );
      throw new ErrorHandler(error.code, errorMessage);
    }
  }
}
