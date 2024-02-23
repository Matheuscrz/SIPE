import { RedisCache } from "../config/Redis";
import { Database } from "../config/Database";

/*
 * Classe de controle para revogação de tokens
 */
export class TokenRevocationController {
  /**
   *Verifica se o token está na lista de tokens revogados
   * @param token - token a ser verificado
   * @returns true se o token estiver na lista de tokens revogados, false caso contrário
   */
  static async isTokenRevoked(token: string): Promise<boolean> {
    const cachedRevoked = await RedisCache.get(`revogado-token:${token}`);
    if (cachedRevoked) {
      return true;
    } else {
      try {
        const result = await Database.query(
          "SELECT * FROM tokens_revogados WHERE token = $1",
          [token]
        );
        if (result.rows.length > 0) {
          await RedisCache.setex(`revogado-token:${token}`, 604800, "true");
          return true;
        }
        return false;
      } catch (error) {
        console.error("Erro ao verificar se o token está revogado: ", error);
        throw error;
      }
    }
  }
  /**
   * Adiciona um token à lista de tokens revogados e ao cache
   * @param token - token a ser revogado
   * @returns {Promise<void>}
   */
  static async revokeToken(token: string): Promise<void> {
    try {
      await Database.query("INSERT INTO tokens_revogados (token) VALUES ($1)", [
        token,
      ]);
      await RedisCache.setex(`revogado-token:${token}`, 604800, "true");
    } catch (error) {
      console.error("Erro ao revogar token: ", error);
      throw error;
    }
  }
}
