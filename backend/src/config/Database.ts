import { Pool, PoolClient, QueryResult } from "pg";
import dotenv from "dotenv";

dotenv.config();

export class Database {
  private static pool: Pool;
  private static readonly user = process.env.DB_USER;
  private static readonly host = process.env.DB_HOST;
  private static readonly database = process.env.DB_DATABASE;
  private static readonly password = process.env.DB_PASSWORD;
  private static readonly port = process.env.DB_PORT || "5432";

  static initialize() {
    Database.pool = new Pool({
      user: Database.user,
      host: Database.host,
      database: Database.database,
      password: Database.password,
      port: parseInt(Database.port, 10),
    });
    Database.testConnection();
  }

  private static async testConnection() {
    let client: PoolClient | null = null;
    try {
      client = await Database.pool.connect();
      console.log("Conexão de teste ao banco de dados realizada com sucesso!");
    } catch (error) {
      console.error("Erro ao conectar ao banco de dados: ", error);
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  static async query(query: string, params: any[] = []): Promise<QueryResult> {
    let client: PoolClient | null = null;
    try {
      client = await Database.pool.connect();
      return await client.query(query, params);
    } finally {
      if (client) {
        client.release();
      }
    }
  }
}

// Inicialize a conexão quando o arquivo for carregado
Database.initialize();
