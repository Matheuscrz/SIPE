import express, { Request, Response, Router } from "express";
import { UserModel } from "../models/UserModel";
import { PasswordUtils } from "../utils/PasswordUtils";
import { User as UserEntity } from "../interfaces/User";
import { UserUtils } from "../utils/UserUtils";
import { AppLogger } from "../config/AppLogger";

/**
 * Classe de rotas para do tipo Post
 * @class PostRoutes
 * @extends {Router}
 */
export class PostRoutes {
  private readonly router: Router;

  /**
   * Cria uma instância de PostRoutes.
   * @memberof PostRoutes
   * @constructor
   */
  constructor() {
    this.router = express.Router();
    this.configureRoutes();
  }

  /**
   * Configura as rotas para o tipo Post
   * @private
   * @memberof PostRoutes
   * @method configureRoutes
   * @returns {void}
   */
  private configureRoutes() {
    this.router.post("/createuser", this.createUser.bind(this));
  }

  private async createUser(req: Request, res: Response): Promise<void> {
    try {
      const user: UserEntity = req.body;
      const isValid = UserUtils.validateUser(user);
      if (!isValid) {
        res.status(400).send("Dados de usuário inválidos");
        return;
      }

      const hashedPassword = await PasswordUtils.hashPassword(
        user.personalData.password
      );
      const createUser = await UserModel.addUser({
        ...user,
        personalData: {
          ...user.personalData,
          password: hashedPassword,
        },
      });
      res.status(201).send(createUser);
    } catch (error) {
      AppLogger.getInstance().error(`Erro ao criar usuário. Erro: ${error}`);
      res.status(500).send("Erro interno do servidor");
    }
  }

  /**
   * Retorna um objeto Router
   * @returns {Router}
   * @memberof PostRoutes
   * @method getRouter
   */
  public getRouter(): Router {
    return this.router;
  }
}
