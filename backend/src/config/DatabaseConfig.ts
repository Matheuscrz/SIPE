import { Pool, PoolConfig } from "pg";

export class DatabaseConfig {
  private static pool: Pool;

  // Método estático para configurar o pool de conexões do banco de dados
  public static configure(config: PoolConfig): void {
    if (!this.pool) {
      // Criar uma instância única do pool de conexões
      this.pool = new Pool(config);

      // Lidar com o evento 'beforeExit' para encerrar o pool antes de encerrar o aplicativo
      process.on("beforeExit", async () => {
        await this.pool.end();
        console.log("Database pool closed");
      });

      // Lidar com eventos de exceção não capturados para encerrar o pool e encerrar o aplicativo
      process.on("uncaughtException", async (error) => {
        console.error("Uncaught exception, closing database pool", error);
        await this.pool.end();
        process.exit(1);
      });

      // Lidar com rejeições não tratadas de promessas para encerrar o pool e encerrar o aplicativo
      process.on("unhandledRejection", async (reason) => {
        console.error("Unhandled rejection, closing database pool", reason);
        await this.pool.end();
        process.exit(1);
      });
    }
  }

  // Método estático para obter o pool de conexões do banco de dados
  public static getPool(): Pool {
    if (!this.pool) {
      throw new Error("Database pool not initialized");
    }
    return this.pool;
  }
}
