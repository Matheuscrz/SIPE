import express, { Request, Response, Router } from "express";
import { UserModel } from "../models/UserModel";
import { PasswordUtils } from "../utils/PasswordUtils";
import { User as UserEntity } from "../interfaces/User";
import { AppLogger } from "../config/AppLogger";
import { AuthService } from "../services/AuthService";
import { ErrorHandler } from "../error/ErrorHandler";
/**
 * @class PostRoutes
 * @extends {Router}
 * @description Classe de rotas do tipo Post
 */
export class PostRoutes {
  private readonly router: Router;

  /**
   * @memberof PostRoutes
   * @constructor
   * @description Construtor da classe
   */
  constructor() {
    this.router = express.Router();
    this.configureRoutes();
  }

  /**
   * @private
   * @memberof PostRoutes
   * @description Configura as rotas para o tipo Post
   */
  private configureRoutes() {
    this.router.post("/createuser", this.createUser.bind(this));
    this.router.post("/login", this.login.bind(this));
  }

  /**
   * @param req Request
   * @param res Response
   * @returns
   * @description Método para realizar login
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
    } catch (error: any) {
      let errorMessage;
      if (error instanceof ErrorHandler) {
        switch (error.code) {
          case "23505":
            errorMessage = "Usuário já está logado";
            AppLogger.getInstance().error(errorMessage, error);
            res.status(401).send(errorMessage);
            break;
          default:
            errorMessage = `Erro interno do servidor. Error: `;
            AppLogger.getInstance().error(errorMessage, error);
            res.status(500).send(errorMessage);
            break;
        }
      } else {
        AppLogger.getInstance().error(
          `Erro interno do servidor. Error: `,
          error
        );
        res.status(500).send("Erro interno do servidor");
      }
    }
  }

  /**
   * @param req Request
   * @param res Response
   * @returns
   * @description Método para criar um usuário
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
          role_name: data.role,
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
      if (error instanceof ErrorHandler) {
        switch (error.code) {
          case "23505":
            AppLogger.getInstance().error(
              "Usuário já cadastrado. Error: ",
              error
            );
            res.status(400).send("Usuário já cadastrado");
            break;
          case "22P02":
            AppLogger.getInstance().error("Dado inválido. Error: ", error);
            res.status(400).send("Dado inválido");
            break;
          default:
            AppLogger.getInstance().error(
              "Erro interno do servidor. Error: ",
              error
            );
            res.status(500).send("Erro interno do servidor");
            break;
        }
      } else {
        AppLogger.getInstance().error(
          "Erro interno do servidor. Error: ",
          error
        );
        res.status(500).send("Erro interno do servidor");
      }
    }
  }

  /**
   * @returns {Router}
   * @memberof PostRoutes
   * @method getRouter
   * @description Retorna um objeto Router
   */
  public getRouter(): Router {
    return this.router;
  }
}
