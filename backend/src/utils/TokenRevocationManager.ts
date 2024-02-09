import Redis, {
  CommonRedisOptions,
  Redis as RedisClient,
  RedisOptions,
} from "ioredis";

export class TokenRevocationManager {
  private redisClient: RedisClient;

  // Construtor que aceita opções do Redis ou usa as opções padrão se não fornecidas
  constructor(redisOptions?: RedisOptions | CommonRedisOptions) {
    this.redisClient = new Redis(redisOptions || {});
  }

  // Adiciona um token de atualização associado a um usuário no Redis com um tempo de expiração
  addRefreshTokenForUser(userId: string, refreshToken: string): void {
    this.redisClient.set(userId, refreshToken, "EX", 604800); // 604800 segundos = 7 dias
  }

  // Remove um token de atualização associado a um usuário do Redis
  removeRefreshTokenForUser(userId: string): void {
    this.redisClient.del(userId);
  }

  // Verifica se um token de atualização específico está revogado para um usuário
  isRefreshTokenRevoked(
    userId: string,
    refreshToken: string
  ): Promise<boolean> {
    // Obtém o token de atualização armazenado no Redis e verifica se é igual ao fornecido
    const storedRefreshToken = this.redisClient.get(userId);
    return storedRefreshToken.then((token) => token !== refreshToken);
  }
}
