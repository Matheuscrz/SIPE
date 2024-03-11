import express, { Request, Response, Router } from "express";
import { UserModel } from "../models/UserModel";
import { PasswordUtils } from "../utils/PasswordUtils";
import { Regime, User as UserEntity } from "../interfaces/User";
import { AppLogger } from "../config/AppLogger";
import { AuthService } from "../services/AuthService";
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
    this.router.post("/login", this.login.bind(this));
    this.router.post("/logout", this.logout.bind(this));
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
   * Método para realizar logout
   * @param req - Request
   * @param res - Response
   * @returns
   */
  private async logout(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.body.userId;
      if (!userId) {
        res.status(400).send("ID do usuário não informado");
        return;
      } else {
        await AuthService.logout(userId);
        res.status(200).send("Usuário deslogado com sucesso");
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
          department: data.department,
          roles: data.role,
          work_schedule: data.work_schedule,
          hiring_date: data.hiring_date,
          regime: Regime.CLT,
          permission: data.permission || null,
          created_at: "",
          active: true,
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
