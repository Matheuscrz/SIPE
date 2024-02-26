import Redis from "ioredis";
import dotenv from "dotenv";
import { AppLogger } from "./AppLogger";

dotenv.config();

/**
 * Classe RedisCache responsável por gerenciar o cache usando Redis.
 * @class
 */
export class RedisCache {
  private static readonly redisClient = new Redis({
    host: process.env.REDIS_HOST, // Host do servidor Redis
    port: Number(process.env.REDIS_PORT), // Porta do servidor Redis
    connectTimeout: 10000, // Tempo limite de conexão em milissegundos
  });

  /**
   * Obtém um valor do cache do Redis.
   * @param {string} key - Chave do cache a ser recuperada.
   * @returns {Promise<string | null>} Valor associado à chave ou null se a chave não existir.
   */
  static async get(key: string): Promise<string | null> {
    try {
      AppLogger.getInstance().info(
        `Obtendo valor do cache do Redis. Chave: ${key}`
      );
      return await this.redisClient.get(key);
    } catch (error) {
      AppLogger.getInstance().error(
        "Erro ao obter valor do cache do Redis",
        error
      );
      throw error;
    }
  }

  /**
   * Define um valor no cache do Redis.
   * @param {string} key - Chave do cache a ser definida.
   * @param {string} value - Valor a ser associado à chave.
   * @returns {Promise<void>}
   */
  static async set(key: string, value: string): Promise<void> {
    try {
      AppLogger.getInstance().info(
        `Armazenando valor no cache do Redis. Chave: ${key}`
      );
      await this.redisClient.set(key, value);
    } catch (error) {
      AppLogger.getInstance().error(
        "Erro ao definir valor no cache do Redis",
        error
      );
      throw error;
    }
  }

  /**
   * Remove uma chave do cache do Redis.
   * @param {string} key - Chave a ser removida.
   * @returns {Promise<void>}
   */
  static async del(key: string): Promise<void> {
    try {
      AppLogger.getInstance().info(
        `Removendo chave do cache do Redis. Chave: ${key}`
      );
      await this.redisClient.unlink(key);
    } catch (error) {
      AppLogger.getInstance().error(
        "Erro ao remover chave do cache do Redis",
        error
      );
      throw error;
    }
  }
}
