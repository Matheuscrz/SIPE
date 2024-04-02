import { Pool, PoolClient, QueryResult } from "pg";
import dotenv from "dotenv";
import { AppLogger } from "./AppLogger";
import { ErrorHandler } from "../error/ErrorHandler";

dotenv.config();

/**
 * @class Database
 * @description Singleton para conexão com o banco de dados
 */
export class Database {
  private static pool: Pool;
  private static readonly user = process.env.DB_USER;
  private static readonly host = process.env.DB_HOST;
  private static readonly database = process.env.DB_DATABASE;
  private static readonly password = process.env.DB_PASSWORD;
  private static readonly port = process.env.DB_PORT || "5432";

  /**
   * @static
   * @throws {Error} Erro ao inicializar a conexão com o banco de dados
   * @memberof Database
   * @description Inicializa a conexão com o banco de dados
   */
  static initialize() {
    try {
      Database.pool = new Pool({
        user: Database.user,
        host: Database.host,
        database: Database.database,
        password: Database.password,
        port: parseInt(Database.port, 10),
      });
      AppLogger.getInstance().info("Conexão com o banco de dados inicializada");
      Database.testConnection();
    } catch (error) {
      AppLogger.getInstance().error("Erro: ", error);
      throw error;
    }
  }

  /**
   * @static
   * @throws {ErrorHandler} Erro ao testar a conexão com o banco de dados
   * @memberof Database
   * @description Testa a conexão com o banco de dados
   */
  private static async testConnection() {
    let client: PoolClient | null = null;
    try {
      client = await Database.pool.connect();
      AppLogger.getInstance().info(
        "Conexão com o banco de dados realizada com sucesso"
      );
    } catch (error: any) {
      const errorMessage = "Erro ao testar a conexão com o banco de dados";
      AppLogger.getInstance().error(errorMessage, error);
      throw new ErrorHandler(error.code, errorMessage);
    } finally {
      try {
        if (client) {
          await client.release();
          AppLogger.getInstance().info("Conexão liberada com sucesso.");
        }
      } catch (releaseError: any) {
        AppLogger.getInstance().error("Erro: ", releaseError);
        throw new ErrorHandler(
          releaseError.code,
          "Erro ao liberar conexão com o banco de dados",
          releaseError
        );
      }
    }
  }

  /**
   * @memberof Database
   * @param query Query a ser executada
   * @param params Parâmetros da query
   * @returns Resultado da query
   * @throws {ErrorHandler} Erro ao executar a query
   * @description Executa uma query no banco de dados
   */
  static async query(query: string, params: any[] = []): Promise<QueryResult> {
    let client: PoolClient | null = null;
    try {
      client = await Database.pool.connect();
      AppLogger.getInstance().info(
        "Consulta executada com sucesso. Query: ",
        query
      );
      return await client.query(query, params);
    } catch (error: any) {
      let errorMessage = "Erro ao executar a query";
      switch (error.code) {
        case "23505":
          errorMessage = "Chave duplicada";
          break;
        case "23503":
          errorMessage = "Chave estrangeira não encontrada";
          break;
        case "22P02":
          errorMessage = "Erro de sintaxe";
          break;
        case "42P01":
          errorMessage = "Tabela não encontrada";
          break;
        case "42703":
          errorMessage = "Coluna não encontrada";
          break;
        case "23502":
          errorMessage = "Restrição de dado não nulo violada";
          break;
        case "23514":
          errorMessage = "Restrição de verificação violada";
          break;
        case "22003":
          errorMessage = "Erro de valor de dado";
          break;
        default:
          break;
      }
      throw new ErrorHandler(error.code, errorMessage);
    } finally {
      try {
        if (client) {
          await client.release();
          AppLogger.getInstance().info("Conexão liberada com sucesso.");
        }
      } catch (releaseError: any) {
        AppLogger.getInstance().error("Erro: ", releaseError);
        throw new ErrorHandler(
          releaseError.code,
          "Erro ao liberar conexão com o banco de dados",
          releaseError
        );
      }
    }
  }
}
Database.initialize();
