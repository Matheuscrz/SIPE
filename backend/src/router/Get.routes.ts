import express, { Request, Response, Router } from "express";
import { UserModel } from "../models/UserModel";
import { AppLogger } from "../config/AppLogger";
import { verifyAndRefreshAccessToken } from "../middlewares/tokenMiddleware";
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

  /**
   * Configura as rotas GET
   */
  private configureRoutes() {
    // this.router.get("/user/:id", this.getUserById.bind(this));
    this.router.get("/user/:cpf", this.getUserByCpf.bind(this));
    this.router.get(
      "/hello",
      verifyAndRefreshAccessToken,
      (req: Request, res: Response) => {
        res.status(200).send("Hello World");
      }
    );
  }

  /**
   * @param req - Requisição
   * @param res - Resposta
   * @returns - Retorna um usuário pelo CPF
   */
  private async getUserByCpf(req: Request, res: Response): Promise<void> {
    try {
      const cpf = req.params.cpf;
      const user = await UserModel.getByCpf(cpf);
      if (!user) {
        res.status(404).send(`Usuário não encontrado`);
        return;
      }
      res.status(200).json(user);
    } catch (error) {
      AppLogger.getInstance().error(`Erro interno do servidor. Error: `, error);
      res.status(500).send(error);
    }
  }

  /**
   * @param req - Requisição
   * @param res - Resposta
   * @returns - Retorna um usuário pelo ID
   */
  private async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const user = await UserModel.getById(id);
      if (!user) {
        res.status(404).send(`Usuário não encontrado`);
        return;
      }
      res.status(200).json(user);
    } catch (error) {
      AppLogger.getInstance().error(`Erro interno do servidor. Error: `, error);
      res.status(500).send(error);
    }
  }

  /**
   * Retorna um objeto Router
   * @returns {Router}
   * @memberof GetRoutes
   * @method getRouter
   */
  public getRouter(): Router {
    return this.router;
  }
}
