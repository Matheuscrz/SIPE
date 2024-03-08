import { Pool, PoolClient, QueryResult } from "pg";
import dotenv from "dotenv";
import { AppLogger } from "./AppLogger";

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
      AppLogger.getInstance().error("Erro: ", error);
      throw error;
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
      let erroMessage = "Erro ao testar a conexão com o banco de dados";
      AppLogger.getInstance().error(
        "Erro ao testar a conexão com o banco de dados. Erro: ",
        error
      );
      throw erroMessage;
    } finally {
      try {
        if (client) {
          await client.release();
          AppLogger.getInstance().info("Conexão liberada com sucesso.");
        }
      } catch (releaseError) {
        AppLogger.getInstance().error("Erro: ", releaseError);
        throw releaseError;
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
    } catch (error: any) {
      switch (error.code) {
        case "23505":
          throw new Error("Chave duplicada");
        case "23503":
          throw new Error("Chave estrangeira não encontrada");
        case "22P02":
          throw new Error("Erro de sintaxe");
        case "42P01":
          throw new Error("Tabela não encontrada");
        case "42703":
          throw new Error("Coluna não encontrada");
        case "23502":
          throw new Error("Restrição de dado não nulo violada");
        case "23514":
          throw new Error("Restrição de verificação violada");
        case "22003":
          throw new Error("Erro de valor de dado");
        case "22001":
          throw new Error("Restrição de comprimento de dado violada");
        default:
          throw new Error("Erro ao executar a query");
      }
    } finally {
      try {
        if (client) {
          await client.release();
          AppLogger.getInstance().info("Conexão liberada com sucesso.");
        }
      } catch (releaseError) {
        AppLogger.getInstance().error("Erro: ", releaseError);
        throw releaseError;
      }
    }
  }
}

// Inicialize a conexão quando o arquivo for carregado
Database.initialize();
