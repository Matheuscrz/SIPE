import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { Routes } from "../routes/Routes";
import { Database } from "../config/Database";
import dotenv from "dotenv";

dotenv.config();
// Configuração do banco de dados
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  database: process.env.DB_NAME,
};
export class Server {
  private app: Application;

  constructor() {
    this.app = express();
    this.configureMiddleware();
    this.configureRoutes();
  }

  private configureMiddleware(): void {
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(morgan("combined"));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private configureRoutes(): void {
    const routes = new Routes();
    const baseRoute = process.env.BASE_ROUTE || "/";
    this.app.use(baseRoute, routes.getRouter());
  }

  public start(port: number): void {
    Database.configure(dbConfig);
    this.app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
    });
  }
}
