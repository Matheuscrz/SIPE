import express from "express";
import { Routes } from "./router/Routes";

export class App {
  private readonly app: express.Application;
  private readonly port: number;

  constructor(port: number) {
    this.app = express();
    this.port = port;
    this.configureApp();
  }

  private configureApp(): void {
    const routes = new Routes(this.app);
    this.app.use(routes.getRouter());
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`Servidor escutando na porta: ${this.port}`);
    });
  }
}

// TODO: Implementar sistema de gerenciamento de permissões RBAC
const port = 8000;
const application = new App(port);
application.start();
