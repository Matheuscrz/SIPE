import { Server } from "./server/Server";
import { AuthRoutes } from "./server/routes/AuthRoutes";

class App {
  private server: Server;

  // Construtor da classe App, onde a instância do servidor é criada
  constructor() {
    this.server = new Server();
  }

  // Método de inicialização da aplicação
  public init(): void {
    // Obter o roteador de autenticação e adicioná-lo à aplicação na rota "/auth"
    const authRoutes = new AuthRoutes().getRouter();
    this.server.addRoutes(authRoutes, "");

    // Configurar a porta do servidor a partir das variáveis de ambiente ou usar a porta padrão 3000
    const port = parseInt(process.env.PORT || "3000", 10);

    // Iniciar o servidor na porta especificada
    this.server.start(port);
  }
}

// Criar uma instância da classe App e chamar o método de inicialização
const app = new App();
app.init();
