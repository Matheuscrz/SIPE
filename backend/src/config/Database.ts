import { Pool, PoolConfig, QueryResult } from "pg";

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
      // Cria uma instância única do pool de conexões
      this.pool = new Pool(config);

      // Lida com o evento 'beforeExit' para encerrar o pool antes de encerrar o aplicativo
      process.on("beforeExit", async () => {
        await this.pool.end();
        console.log("Database pool closed");
      });

      // Lida com eventos de exceção não capturados para encerrar o pool e encerrar o aplicativo
      process.on("uncaughtException", async (error) => {
        console.error("Uncaught exception, closing database pool", error);
        await this.pool.end();
        process.exit(1);
      });

      // Lida com rejeições não tratadas de promessas para encerrar o pool e encerrar o aplicativo
      process.on("unhandledRejection", async (reason) => {
        console.error("Unhandled rejection, closing database pool", reason);
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
      throw new Error("Database pool not initialized");
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
    } finally {
      client.release();
    }
  }
}
