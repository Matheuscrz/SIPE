import express from "express";
import { Routes } from "./router/Routes";

/**
 * @class App
 * @description Classe principal da aplicação
 */
export class App {
  private readonly app: express.Application;
  private readonly port: number;

  constructor(port: number) {
    this.app = express();
    this.port = port;
    this.configureApp();
  }
  /**
   * @private
   * @memberof App
   * @description Configura a aplicação
   */
  private configureApp(): void {
    const routes = new Routes(this.app);
    this.app.use(routes.getRouter());
  }
  /**
   * @memberof App
   * @description Inicia a aplicação
   */
  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`Servidor escutando na porta: ${this.port}`);
    });
  }
}

const port = 8000;
const application = new App(port);
application.start();
