import express, { Request, Response, Router } from "express";
import { UserModel } from "../models/UserModel";
import { DepartmentModel } from "../models/DepartmentModel";
import { AppLogger } from "../config/AppLogger";
import { AuthService } from "../services/AuthService";
import { ErrorHandler } from "../error/ErrorHandler";
import { RoleModel } from "../models/RoleModel";
/**
 * @class GetRoutes
 * @extends {Router}
 * @description Classe de rotas do tipo GET
 */
export class GetRoutes {
  private readonly router: Router;

  /**
   * @memberof GetRoutes
   * @constructor
   * @description Construtor da classe
   */
  constructor() {
    this.router = express.Router();
    this.configureRoutes();
  }

  /**
   * @private
   * @memberof GetRoutes
   * @description Configura as rotas para o tipo GET
   */
  private configureRoutes() {
    this.router.get("/user/:cpf", this.getUser.bind(this));
    this.router.get("/home", (req: Request, res: Response) => {
      res.status(200).send("Bem-vindo à página inicial");
    });
    this.router.get("/logout", this.logout.bind(this));
    this.router.get("/departments", this.getDepartments.bind(this));
    this.router.get("/roles", this.getRoles.bind(this));
  }

  /**
   * @param req Requisição
   * @param res Resposta
   * @returns Realiza o logout do usuário
   * @description Método para realizar logout
   */
  private async logout(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers["x-refresh-token"];
      if (!token) {
        res.status(400).send("Token não informado");
        return;
      } else {
        delete req.headers["x-access-token"];
        delete req.headers["x-refresh-token"];
        await AuthService.logout(token.toString());
        res.status(200).send("Usuário deslogado com sucesso");
      }
    } catch (error: any) {
      AppLogger.getInstance().error(`Erro interno do servidor. Error: `, error);
      res.status(500).send(error);
    }
  }
  /**
   * @param req Requisição
   * @param res Resposta
   * @returns Retorna um usuário pelo CPF
   * @description Método para retornar um usuário pelo CPF
   */
  private async getUser(req: Request, res: Response): Promise<void> {
    try {
      const cpf = req.params.cpf;
      const user = await UserModel.getByCpf(cpf);
      if (!user) {
        res.status(404).send(`Usuário não encontrado`);
        return;
      }
      res.status(200).json(user);
    } catch (error) {
      if (error instanceof ErrorHandler) {
        switch (error.code) {
          case "23503":
            AppLogger.getInstance().error(
              "Chave estrangeira não encontrada. Error: ",
              error
            );
            res.status(404).send("Usuário não encontrado");
            break;
          case "22P02":
            AppLogger.getInstance().error("CPF inválido. Error: ", error);
            res.status(400).send("CPF inválido");
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

  private async getDepartments(req: Request, res: Response): Promise<void> {
    try {
      const departments = await DepartmentModel.getAll();
      res.status(200).json(departments);
    } catch (error) {
      if (error instanceof ErrorHandler) {
        switch (error.code) {
          case "23503":
            AppLogger.getInstance().error(
              "Chave estrangeira não encontrada. Error: ",
              error
            );
            res.status(404).send("Departamento não encontrado");
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

  private async getRoles(req: Request, res: Response): Promise<void> {
    try {
      const roles = await RoleModel.getAll();
      res.status(200).json(roles);
    } catch (error) {
      if (error instanceof ErrorHandler) {
        switch (error.code) {
          case "23503":
            AppLogger.getInstance().error(
              "Chave estrangeira não encontrada. Error: ",
              error
            );
            res.status(404).send("Cargo não encontrado");
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
   * @memberof GetRoutes
   * @method getRouter
   * @description Retorna um objeto Router
   */
  public getRouter(): Router {
    return this.router;
  }
}
