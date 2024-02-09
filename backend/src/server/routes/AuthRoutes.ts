import express, { Router } from "express";
import { AuthMiddleware } from "../../auth/middlewares/AuthMiddleware";
import { AuthService } from "../../auth/services/AuthService";

export class AuthRoutes {
  private router: Router;
  private authService: AuthService;

  constructor() {
    // Inicializar o roteador e o serviço de autenticação
    this.router = express.Router();
    this.authService = new AuthService();

    // Configurar as rotas
    this.setupRoutes();
  }

  // Método privado para configurar as rotas de autenticação
  private setupRoutes() {
    // Rota para lidar com a solicitação de login
    this.router.post("/login", this.login.bind(this));

    // Rota para lidar com a solicitação de logout, utilizando o middleware de autenticação
    this.router.post("/logout", AuthMiddleware, this.logout.bind(this));
  }

  // Método privado para lidar com a solicitação de login
  private async login(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    try {
      // Obter nome de usuário e senha da solicitação
      const { username, password } = req.body;

      // Chamar o serviço de autenticação para realizar o login
      const accessToken = await this.authService.login(username, password);

      // Responder com o token de acesso
      res.json({ accessToken });
    } catch (error) {
      console.error(error);

      // Responder com status 401 (Unauthorized) em caso de falha no login
      res.status(401).send({ message: "Invalid username or password" });
    }
  }

  // Método privado para lidar com a solicitação de logout
  private async logout(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    try {
      // Obter o token de atualização da solicitação
      const refreshToken = req.body.refreshToken;

      // Chamar o serviço de autenticação para realizar o logout
      await this.authService.logout(refreshToken);

      // Responder com status 200 (OK) em caso de logout bem-sucedido
      res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      console.error(error);

      // Responder com status 500 (Internal Server Error) em caso de erro interno
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // Método público para obter o roteador configurado
  public getRouter(): Router {
    return this.router;
  }
}
