import express, { Application, Router } from "express";
import cors from "cors";
import helmet from "helmet";
import {
  logger,
  httpLogger,
  errorLogger,
} from "../middlewares/loggerMiddleware";

export class Server {
  private app: Application;

  constructor() {
    // Inicializar a aplicação Express
    this.app = express();

    // Configurar middlewares
    this.setupMiddlewares();
  }

  // Método privado para configurar os middlewares da aplicação
  private setupMiddlewares(): void {
    // Adicionar middleware Helmet para segurança HTTP
    this.app.use(helmet());

    // Adicionar middleware para logs HTTP
    this.app.use(httpLogger);

    // Adicionar middleware para tratamento de erros
    this.app.use(errorLogger);

    // Permitir o uso de JSON no corpo das solicitações
    this.app.use(express.json());

    // Habilitar o CORS para permitir solicitações de diferentes origens
    this.app.use(
      cors({
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
      })
    );

    // Adicionar middleware para tratamento de erros
    this.app.use(this.errorHandler.bind(this));
  }

  // Middleware para tratamento de erros
  private errorHandler(
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): void {
    console.error(err);

    // Responder com status 500 (Internal Server Error) em caso de erro interno
    res.status(500).send({ message: "Internal server error" });
  }

  // Método público para adicionar rotas à aplicação
  public addRoutes(route: Router, basePath: string): void {
    this.app.use(basePath, route);
  }

  // Método público para iniciar o servidor na porta especificada
  public start(port: number): void {
    this.app.listen(port, () => {
      console.log(`Servidor iniciado na porta ${port}`);
    });
  }
}
