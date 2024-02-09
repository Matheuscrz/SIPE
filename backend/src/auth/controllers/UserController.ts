import { Pool, QueryResult } from "pg";
import { UserEntity } from "../../models/User";
import bcrypt from "bcrypt";
import validator from "validator";

export class UserController {
  private pool: Pool;
  private readonly maxLoginAttempts = 5;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  // Método para autenticar usuário com base em nome de usuário e senha
  public async getUserByUsernameAndPassword(
    username: string,
    password: string
  ): Promise<UserEntity | null> {
    // Validar o formato do nome de usuário
    if (!validator.isAlphanumeric(username)) {
      throw new Error("Invalid username");
    }

    // Validar comprimento mínimo da senha
    if (!validator.isLength(password, { min: 8 })) {
      throw new Error("Password must have at least 8 characters");
    }

    // Obter uma conexão do pool de banco de dados
    const client = await this.pool.connect();

    try {
      // Consultar o banco de dados para encontrar um usuário correspondente
      const queryText =
        "SELECT * FROM users WHERE username = $1 AND password = $2";
      const queryParams = [username, password];
      const result: QueryResult = await client.query(queryText, queryParams);

      // Se um usuário for encontrado
      if (result.rows.length === 1) {
        const user = result.rows[0] as UserEntity;

        // Verificar se a senha fornecida é correta usando bcrypt
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (isPasswordCorrect) {
          // Resetar as tentativas de login após um login bem-sucedido
          await this.resetLoginAttempts(user.id);
          return user;
        } else {
          // Incrementar as tentativas de login após uma tentativa mal-sucedida
          await this.incrementLoginAttempts(user.id);
        }
      }
      return null; // Retornar nulo se nenhum usuário for encontrado
    } finally {
      client.release(); // Liberar a conexão de volta ao pool
    }
  }

  // Método para resetar as tentativas de login de um usuário
  public async resetLoginAttempts(userId: string): Promise<void> {
    const resetQueryText = "UPDATE users SET login_attempts = 0 WHERE id = $1";
    await this.pool.query(resetQueryText, [userId]);
  }

  // Método para incrementar as tentativas de login de um usuário
  public async incrementLoginAttempts(userId: string): Promise<void> {
    const incrementQueryText =
      "UPDATE users SET login_attempts = login_attempts + 1 WHERE id = $1";
    const result = await this.pool.query(incrementQueryText, [userId]);

    if (result.rows.length === 1) {
      const loginAttempts = result.rows[0].login_attempts;

      // Se o número de tentativas de login atingir o limite máximo, bloquear o usuário
      if (loginAttempts >= this.maxLoginAttempts) {
        const lockQueryText = "UPDATE users SET is_locked = true WHERE id = $1";
        await this.pool.query(lockQueryText, [userId]);
      }
    }
  }
}
