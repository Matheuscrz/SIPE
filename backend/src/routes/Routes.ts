// routes/Routes.ts
import express, { Router, Request, Response } from "express";
import { authenticationMiddleware } from "../middlewares/AuthMiddleware";
import { AuthService } from "../services/AuthService";

class Routes {
  private readonly router: Router;

  constructor() {
    this.router = express.Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post("/login", this.loginHandler);
    this.router.get(
      "/protected",
      authenticationMiddleware,
      this.protectedRouteHandler
    );
  }

  private async loginHandler(req: Request, res: Response): Promise<void> {
    const { cpf, password } = req.body;

    try {
      const refreshToken = await AuthService.authenticateUser(cpf, password);

      if (refreshToken) {
        res.status(200).json({ refreshToken });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }

  private protectedRouteHandler(req: Request, res: Response): void {
    res
      .status(200)
      .json({ message: "You have access to this protected route!" });
  }

  public getRouter(): Router {
    return this.router;
  }
}

export default Routes;
