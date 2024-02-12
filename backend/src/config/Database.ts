import { Pool, PoolConfig, QueryResult } from "pg";
import dotenv from "dotenv";

dotenv.config();

/**
 * Classe Database responsável pela interação com o banco de dados PostgreSQL.
 */
export class Database {
  private static pool: Pool;

  /**
   * Configura o pool de conexões do banco de dados.
   * @param config - Configurações para o pool de conexões.
   */
  public static configure(config: PoolConfig): void {
    if (!this.pool) {
      this.pool = new Pool(config);
      process.on("beforeExit", async () => {
        await this.pool.end();
        console.log("Pool de banco de dados fechado");
      });
      process.on("uncaughtException", async (error) => {
        console.error(
          "Exceção não capturada, fechando pool de banco de dados",
          error
        );
        await this.pool.end();
        process.exit(1);
      });
      process.on("unhandledRejection", async (reason) => {
        console.error(
          "Rejeição não tratada, fechando pool de banco de dados",
          reason
        );
        await this.pool.end();
        process.exit(1);
      });
    }
  }

  /**
   * Obtém o pool de conexões do banco de dados.
   * @returns Pool de conexões do banco de dados.
   * @throws Error se o pool não estiver inicializado.
   */
  public static getPool(): Pool {
    if (!this.pool) {
      throw new Error("Pool de banco de dados não inicializado");
    }
    return this.pool;
  }

  /**
   * Executa uma consulta SQL no banco de dados.
   * @param sql - Consulta SQL a ser executada.
   * @param values - Valores a serem usados na consulta (opcional).
   * @returns Resultado da consulta.
   */
  public static async query(sql: string, values?: any[]): Promise<QueryResult> {
    const client = await this.pool.connect();
    try {
      return await client.query(sql, values);
    } catch (error) {
      console.error("Erro ao executar consulta SQL", error);
      throw error; // Propaga o erro para o chamador
    } finally {
      client.release();
    }
  }

  /**
   * Inicia uma transação no banco de dados.
   */
  public static async beginTransaction(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
    } catch (error) {
      console.error("Erro ao iniciar transação", error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Confirma uma transação no banco de dados.
   */
  public static async commitTransaction(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query("COMMIT");
    } catch (error) {
      console.error("Erro ao confirmar transação", error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Reverte uma transação no banco de dados.
   */
  public static async rollbackTransaction(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query("ROLLBACK");
    } catch (error) {
      console.error("Erro ao reverter transação", error);
      throw error;
    } finally {
      client.release();
    }
  }
}
