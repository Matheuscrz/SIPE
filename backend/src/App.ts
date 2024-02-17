import "./utils/logger-setup";
import { Server } from "./server/Server";

class App {
  private server: Server;

  constructor() {
    const port = process.env.PORT ? Number(process.env.PORT) : 3000;

    this.server = new Server(port);
  }

  public start(): void {
    this.server.start();
  }
}

const app = new App();
app.start();
