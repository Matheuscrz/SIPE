import express from "express";
import { AuthService } from "../services/AuthService";
import { isAuthenticatedMiddleware } from "../middlewares/isAuthenticatedMiddleware";

export class Routes {
  private router: express.Router;

  constructor() {
    this.router = express.Router();
    this.configureRoutes();
  }

  private configureRoutes(): void {
    // Rota de login
    this.router.post("/login", async (req, res) => {
      const { cpf, password } = req.body;

      if (!cpf || !password) {
        return res
          .status(400)
          .json({ message: "CPF e senha são obrigatórios" });
      }

      try {
        const userWithToken = await AuthService.authenticate(cpf, password);

        if (userWithToken) {
          return res.json(userWithToken);
        } else {
          return res.status(401).json({ message: "Credenciais inválidas" });
        }
      } catch (error) {
        console.error("Erro durante o login:", error);
        return res.status(500).json({ message: "Erro interno do servidor" });
      }
    });

    // Rota protegida "hello"
    this.router.get("/hello", isAuthenticatedMiddleware, (req, res) => {
      return res.json({ message: "Hello, user!" });
    });

    // Rota de logout
    this.router.post("/logout", isAuthenticatedMiddleware, async (req, res) => {
      // Lógica de logout, remoção de tokens, etc.
      return res.json({ message: "Logout realizado com sucesso" });
    });
  }

  public getRouter(): express.Router {
    return this.router;
  }
}
