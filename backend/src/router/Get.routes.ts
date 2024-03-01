import express, { Request, Response, Router } from "express";
import { UserModel } from "../models/UserModel";
import { AppLogger } from "../config/AppLogger";
import { User, User as UserEntity } from "../interfaces/User";
import { UserUtils } from "../utils/UserUtils";
import { ErrorHandler } from "../config/ErroHandler";

/**
 * Classe de rotas para do tipo Get
 * @class GetRoutes
 * @extends {Router}
 */
export class GetRoutes {
  private readonly router: Router;

  /**
   * Cria uma instância de GetRoutes.
   * @memberof GetRoutes
   * @constructor
   */
  constructor() {
    this.router = express.Router();
    this.configureRoutes();
  }

  private configureRoutes() {
    this.router.get("/user/:id", this.getUserById.bind(this));
  }

  private async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const user = await UserModel.getById(id);
      if (!user) {
        ErrorHandler.handleNotFound(
          res,
          `Usuário com o ID ${id} não encontrado`
        );
        return;
      }
      res.status(200).json(user);
    } catch (error) {
      ErrorHandler.handleInternalServerError(
        res,
        `Erro interno do servidor. Error: ${error}`
      );
      res.status(500).send("Erro interno do servidor");
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
