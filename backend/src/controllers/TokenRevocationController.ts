import { RedisCache } from "../config/Redis";
import { Database } from "../config/Database";

export class TokenRevocationController {
  /**
   * Revoga um token, adicionando-o à lista de tokens revogados.
   * @param token - O token a ser revogado.
   * @returns Promise<boolean> - Retorna `true` se o token foi revogado com sucesso, `false` em caso de falha.
   */
  static async revokeToken(token: string): Promise<boolean> {
    try {
      // Adiciona o token à lista de tokens revogados no Redis
      await RedisCache.set(token, "revoked");

      //Insere o token revogado no banco de dados
      await Database.query(
        "INSERT INTO point.revoked_tokens (token, expires_at) VALUES ($1, $2)",
        [token, new Date()]
      );
      return true;
    } catch (error) {
      console.error("Erro ao revogar token:", error);
      return false;
    }
  }

  /**
   * Verifica se um token foi revogado.
   * @param token - O token a ser verificado.
   * @returns Promise<boolean> - Retorna `true` se o token foi revogado, `false` caso contrário.
   */
  static async isTokenRevoked(token: string): Promise<boolean> {
    try {
      const cachedToken = await RedisCache.get(token);
      if (cachedToken === "revoked") {
        return true;
      }
      // Verifica se o token está no banco de dados
      const result = await Database.query(
        "SELECT EXISTS (SELECT 1 FROM point.revoked_tokens WHERE token = $1) AS revoked",
        [token]
      );
      return result.rows[0].revoked;
    } catch (error) {
      console.error("Error checking token revocation:", error);
      return false;
    }
  }
}
