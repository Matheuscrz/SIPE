import { JwtUtils } from "../../utils/JwtUtils";
import { TokenRevocationManager } from "../../utils/TokenRevocationManager";
import { UserController } from "../controllers/UserController";
import { DatabaseConfig } from "../../config/DatabaseConfig";
import bcrypt from "bcrypt";

export class AuthService {
  private userController: UserController;
  private tokenRevocationManager: TokenRevocationManager;

  constructor() {
    // Configurar o banco de dados com as informações do ambiente
    const dbConfig = {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || "5432", 10),
      database: process.env.DB_DATABASE,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    };
    DatabaseConfig.configure(dbConfig);

    // Inicializar instâncias do controlador de usuário e gerenciador de revogação de token
    this.userController = new UserController(DatabaseConfig.getPool());
    this.tokenRevocationManager = new TokenRevocationManager();
  }

  // Método para autenticar um usuário e gerar tokens de acesso e atualização
  public async login(username: string, password: string): Promise<string> {
    // Obter informações do usuário com base no nome de usuário e senha fornecidos
    const user = await this.userController.getUserByUsernameAndPassword(
      username,
      password
    );

    if (user) {
      // Verificar se o usuário está bloqueado devido a muitas tentativas de login
      if (
        user.login_attempts &&
        user.login_attempts >= user.max_login_attempts
      ) {
        throw new Error("User is locked");
      }

      // Verificar se a senha fornecida é correta
      const isPasswordCorrect = await bcrypt.compare(password, user.password);

      if (isPasswordCorrect) {
        // Gerar tokens de acesso e atualização
        const accessToken = JwtUtils.generateAccessToken(user);
        const refreshToken = JwtUtils.generateRefreshToken(user);

        // Adicionar o token de atualização ao gerenciador de revogação de token
        this.tokenRevocationManager.addRefreshTokenForUser(
          user.id,
          refreshToken
        );

        // Resetar as tentativas de login bem-sucedidas
        await this.userController.resetLoginAttempts(user.id);

        // Retornar o token de acesso
        return accessToken;
      } else {
        // Incrementar as tentativas de login mal-sucedidas
        await this.userController.incrementLoginAttempts(user.id);
      }
    }

    // Lançar um erro se as credenciais forem inválidas
    throw new Error("Invalid username or password");
  }

  // Método para realizar logout e remover o token de atualização
  public async logout(refreshToken: string): Promise<void> {
    // Verificar e decodificar o token de atualização
    const decodedToken = JwtUtils.verifyToken(refreshToken) as {
      userId: string;
    };

    if (decodedToken) {
      // Remover o token de atualização do gerenciador de revogação de token
      await this.tokenRevocationManager.removeRefreshTokenForUser(
        decodedToken.userId
      );
    } else {
      // Lançar um erro se o token de atualização for inválido
      throw new Error("Invalid refresh token");
    }
  }
}
