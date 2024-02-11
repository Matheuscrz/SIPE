import Server from "./server/Server";

// Define a porta que deseja usar
const PORT: number = parseInt(process.env.PORT || "3000", 10);

// Crie uma instância do servidor e inicie-o
const server = new Server(PORT);
server.start();
