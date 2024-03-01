import express, { Request, Response, Router } from "express";
import { UserModel } from "../models/UserModel";
import { PasswordUtils } from "../utils/PasswordUtils";
import { User as UserEntity } from "../interfaces/User";
import { AppLogger } from "../config/AppLogger";
import { ErrorHandler } from "../config/ErroHandler";

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
      const data = req.body;
      if (!data) {
        res.status(400).send("Dados de usuário não informados");
        return;
      } else {
        const user: UserEntity = {
          id: "",
          personalData: {
            name: data.name,
            password: data.password,
            cpf: data.cpf,
            pis: data.pis,
            pin: data.pin,
            gender: data.gender,
            birthDate: new Date(data.birthDate),
          },
          employmentData: {
            departmentId: data.departmentId,
            roleId: data.roleId,
            workScheduleId: data.workScheduleId,
            hiringDate: new Date(data.hiringDate),
            regime: data.regime,
          },
          permissions: {
            permission: "Normal",
            createdAt: new Date(),
          },
          active: true,
        };
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
      }
    } catch (error) {
      ErrorHandler.handleInternalServerError(
        res,
        `Erro ao criar usuário. Erro interno do servidor. Error: ${error}`
      );
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
