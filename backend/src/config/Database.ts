import { Pool, PoolClient, QueryResult } from "pg";
import dotenv from "dotenv";
import { AppLogger } from "./AppLogger";
// import { ErrorHandler } from "./ErroHandler";

dotenv.config();

/**
 * @class Database
 * @description Classe de configuração do banco de dados
 */
export class Database {
  private static pool: Pool;
  private static readonly user = process.env.DB_USER;
  private static readonly host = process.env.DB_HOST;
  private static readonly database = process.env.DB_DATABASE;
  private static readonly password = process.env.DB_PASSWORD;
  private static readonly port = process.env.DB_PORT || "5432";

  /**
   * Inicializa a conexão com o banco de dados
   * @static
   * @memberof Database
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
      // ErrorHandler.handleGenericError(
      //   "Erro ao inicializar conexão com o banco de dados:",
      //   error
      // );
    }
  }

  /**
   * Testa a conexão com o banco de dados
   * @private
   * @static
   * @memberof Database
   */
  private static async testConnection() {
    let client: PoolClient | null = null;
    try {
      client = await Database.pool.connect();
      AppLogger.getInstance().info(
        "Conexão com o banco de dados realizada com sucesso"
      );
    } catch (error) {
      // ErrorHandler.handleGenericError(
      //   "Erro ao testar conexão com o banco de dados: ",
      //   error
      // );
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  /**
   * Método para executar uma query no banco de dados
   * @param query - Query a ser executada
   * @param params - Parâmetros da query
   * @returns - Resultado da query
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
    } catch (error) {
      // ErrorHandler.handleGenericError("Erro ao executar a consulta: ", error);
      throw error;
    } finally {
      try {
        if (client) {
          await client.release();
          AppLogger.getInstance().info("Conexão liberada com sucesso.");
        }
      } catch (releaseError) {
        // ErrorHandler.handleGenericError(
        //   "Erro ao liberar a conexão com o banco de dados: ",
        //   releaseError
        // );
      }
    }
  }
}

// Inicialize a conexão quando o arquivo for carregado
Database.initialize();
