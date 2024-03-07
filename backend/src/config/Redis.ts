import Redis, { Redis as RedisClient } from "ioredis";
import dotenv from "dotenv";
import { AppLogger } from "./AppLogger";
// import { ErrorHandler } from "./ErroHandler";

dotenv.config();

/**
 * @class RedisCache
 * @description Classe de configuração do cache do Redis
 */
export class RedisCache {
  private static readonly redisClient: RedisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    connectTimeout: 10000,
  });

  /**
   * Método para obter um valor do cache
   * @param key - Chave do cache
   * @returns - Valor do cache ou null se não encontrar
   */
  static async get(key: string): Promise<string | null> {
    try {
      AppLogger.getInstance().info(
        `Obtendo valor do cache do Redis. Chave: ${key}`
      );
      return this.redisClient.get(key);
    } catch (error) {
      // ErrorHandler.handleGenericError(
      //   "Erro ao obter valor do cache do Redis",
      //   error
      // );
      throw error;
    } finally {
      await this.releaseConnection();
    }
  }

  /**
   * Método para definir um valor no cache
   * @param key - Chave do cache
   * @param value - Valor do cache
   */
  static async set(key: string, value: string): Promise<void> {
    try {
      AppLogger.getInstance().info(
        `Armazenando valor no cache do Redis. Chave: ${key}`
      );
      await this.redisClient.set(key, value);
    } catch (error) {
      // ErrorHandler.handleGenericError(
      //   "Erro ao definir valor no cache do Redis",
      //   error
      // );
      throw error;
    } finally {
      await this.releaseConnection();
    }
  }

  /**
   * Método para remover um valor do cache
   * @param key - Chave do cache
   */
  static async del(key: string): Promise<void> {
    try {
      AppLogger.getInstance().info(
        `Removendo chave do cache do Redis. Chave: ${key}`
      );
      await this.redisClient.unlink(key);
    } catch (error) {
      // ErrorHandler.handleGenericError(
      //   "Erro ao remover chave do cache do Redis",
      //   error
      // );
      throw error;
    } finally {
      await this.releaseConnection();
    }
  }

  /**
   * Método para encerrar a conexão com o Redis
   */
  private static async releaseConnection(): Promise<void> {
    try {
      await this.redisClient.quit();
      AppLogger.getInstance().info(
        "Conexão com o Redis foi encerrada com sucesso."
      );
    } catch (releaseError) {
      // ErrorHandler.handleGenericError(
      //   "Erro ao encerrar a conexão com o Redis",
      //   releaseError
      // );
    }
  }
}
