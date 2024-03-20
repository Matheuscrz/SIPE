import express, { Router } from "express";
import cors, { CorsOptions } from "cors";
import loggerMiddleware from "../middlewares/loggerMiddleware";
import { PostRoutes } from "./Post.routes";
import { GetRoutes } from "./Get.routes";

/**
 * @class Routes
 * @method getRouter - retorna um objeto Router
 * @description Classe de configuração de rotas
 */
export class Routes {
  private readonly app: express.Application;

  /**
   * Construtor da classe
   * @param app - aplicação express
   * @constructor
   * @method configureMiddleware - configura os middlewares
   * @method configureRoutes - configura as rotas
   */
  constructor(app: express.Application) {
    this.app = app;
    this.configureMiddleware();
    this.configureRoutes();
  }

  /**
   * Configura os middlewares da aplicação
   * @private
   * @function configureMiddleware
   * @name Routes.configureMiddleware
   */
  private configureMiddleware(): void {
    const corsOptions: CorsOptions = {
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      preflightContinue: false,
      optionsSuccessStatus: 204,
    };
    this.app.use(cors(corsOptions));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(loggerMiddleware);
  }

  /**
   * Configura as rotas da aplicação
   * @private
   * @function configureRoutes
   * @name Routes.configureRoutes
   */
  private configureRoutes(): void {
    const postRoutes = new PostRoutes();
    const getRoutes = new GetRoutes();
    this.app.use(postRoutes.getRouter());
    this.app.use(getRoutes.getRouter());
  }

  /**
   * Retorna um objeto Router
   * @function getRouter
   * @name Routes.getRouter
   * @returns um objeto Router
   */
  public getRouter(): express.Router {
    return Router();
  }
}
