import express, { Router } from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import cors, { CorsOptions } from "cors";
import loggerMiddleware from "../middlewares/loggerMiddleware";
import { permissionMiddleware } from "../middlewares/permissionMiddleware";
import { tokenMiddleware } from "../middlewares/tokenMiddleware";
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
   * @param app - aplicação express
   * @constructor
   * @method configureMiddleware - configura os middlewares
   * @method configureRoutes - configura as rotas
   * @description Construtor da classe
   */
  constructor(app: express.Application) {
    this.app = app;
    this.configureMiddleware();
    this.configureRoutes();
  }

  /**
   * @private
   * @function configureMiddleware
   * @name Routes.configureMiddleware
   * @description Configura os middlewares da aplicação
   */
  private configureMiddleware(): void {
    /**
     * @constant corsOptions
     * @description Configurações do CORS
     */
    const corsOptions: CorsOptions = {
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      preflightContinue: false, // Não continua se a requisição for um OPTIONS
      optionsSuccessStatus: 204,
    };
    /**
     * @constant limiter
     * @description Middleware de limitação de requisições para evitar ataques de força bruta ou DoS
     */
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      limit: 100, // Limite de 100 requisições por IP
      standardHeaders: "draft-7", // RFC-7231
      legacyHeaders: false, // X-RateLimit-* headers - RFC-6585
      skipSuccessfulRequests: true, // Não contabiliza requisições com status 2xx
      skipFailedRequests: false, // Contabiliza requisições com status 4xx e 5xx
      message: "Muitas requisições, tente novamente mais tarde.", // Mensagem de erro
    });
    this.app.use(cors(corsOptions));
    this.app.use(express.json());
    this.app.use(helmet()); // Adiciona headers de segurança
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(limiter);
    this.app.use(loggerMiddleware);
    this.app.use(permissionMiddleware);
    this.app.use(tokenMiddleware);
  }

  /**
   * @private
   * @function configureRoutes
   * @name Routes.configureRoutes
   * @description Configura as rotas da aplicação
   */
  private configureRoutes(): void {
    const postRoutes = new PostRoutes();
    const getRoutes = new GetRoutes();
    this.app.use(postRoutes.getRouter());
    this.app.use(getRoutes.getRouter());
  }

  /**
   * @function getRouter
   * @name Routes.getRouter
   * @returns um objeto Router
   * @description Retorna um objeto Router
   */
  public getRouter(): express.Router {
    return Router();
  }
}
