import Redis from "ioredis";

/**
 * Classe RedisCache responsável por gerenciar o cache usando Redis.
 */
export class RedisCache {
  private static readonly redisClient = new Redis({
    host: process.env.REDIS_HOST, // Host do servidor Redis
    port: Number(process.env.REDIS_PORT), // Porta do servidor Redis
  });

  /**
   * Obtém um valor do cache do Redis.
   * @param key - Chave do cache a ser recuperada.
   * @returns Valor associado à chave ou null se a chave não existir.
   */
  static async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  /**
   * Define um valor no cache do Redis.
   * @param key - Chave do cache a ser definida.
   * @param value - Valor a ser associado à chave.
   */
  static async set(key: string, value: string): Promise<void> {
    await this.redisClient.set(key, value);
  }

  /**
   * Define um valor no cache do Redis com um tempo de expiração.
   * @param key - Chave do cache a ser definida.
   * @param seconds - Tempo de expiração em segundos.
   * @param value - Valor a ser associado à chave.
   */
  static async setex(
    key: string,
    seconds: number,
    value: string
  ): Promise<void> {
    await this.redisClient.setex(key, seconds, value);
  }
}
