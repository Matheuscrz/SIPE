import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import Routes from "../routes/Routes";

class Server {
  private readonly app: Express;
  private readonly port: number;

  constructor(port: number) {
    this.app = express();
    this.port = port;

    this.setupMiddlewares();
    this.setupRoutes();
  }

  private setupMiddlewares(): void {
    this.app.use(express.json());
    this.app.use(cors());
    this.app.use(helmet());
  }

  private setupRoutes(): void {
    const routes = new Routes();
    this.app.use("/api", routes.getRouter());
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`);
    });
  }
}

export default Server;
