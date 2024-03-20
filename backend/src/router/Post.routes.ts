import express, { Request, Response, Router } from "express";
import { UserModel } from "../models/UserModel";
import { PasswordUtils } from "../utils/PasswordUtils";
import { User as UserEntity } from "../interfaces/User";
import { AppLogger } from "../config/AppLogger";
import { AuthService } from "../services/AuthService";
/**
 * @class PostRoutes
 * @extends {Router}
 * @description Classe de rotas do tipo Post
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
    this.router.post("/login", this.login.bind(this));
  }

  /**
   * Método para realizar login
   * @param req - Request
   * @param res - Response
   * @returns
   */
  private async login(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      if (!data) {
        res.status(400).send("Dados de usuário não informados");
        return;
      } else {
        const user = await AuthService.login(data.cpf, data.password);
        if (user) {
          res.status(200).send(user);
        } else {
          res.status(401).send("Usuário ou senha inválidos");
        }
      }
    } catch (error) {
      let errorMessage = `Erro interno do servidor. Error: `;
      AppLogger.getInstance().error(errorMessage, error);
      res.status(500).send(error);
    }
  }

  /**
   * Método para criar um usuário
   * @param req - Request
   * @param res - Response
   * @returns
   */
  private async createUser(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      if (!data) {
        res.status(400).send("Dados de usuário não informados");
        return;
      } else {
        const user: UserEntity = {
          id: "",
          name: data.name,
          password: data.password,
          cpf: data.cpf,
          pis: data.pis,
          pin: data.pin,
          gender: data.gender,
          birth_date: data.birth_date,
          role_id: data.role,
          work_schedule: data.work_schedule,
          hiring_date: data.hiring_date,
          permission: data.permission || null,
          active: true,
          created_at: "",
        };
        const hashedPassword = await PasswordUtils.hashPassword(user.password);
        const createUser = await UserModel.addUser({
          ...user,
          password: hashedPassword,
        });
        res.status(201).send(createUser);
      }
    } catch (error: any) {
      let errorMessage = `Erro interno do servidor. Error: `;
      AppLogger.getInstance().error(errorMessage, error);
      res.status(500).send(error);
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
