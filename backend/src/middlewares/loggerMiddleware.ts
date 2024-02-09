import { Request, Response, NextFunction } from "express";
import winston from "winston";
import morgan from "morgan";
import fs from "fs";
import path from "path";

const logDirectory = path.join(__dirname, "../../logs");

// Cria o diretório de logs se ele não existir
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const logFilePath = path.join(logDirectory, "combined.log");

// Configuração o logger
export const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: logFilePath }),
  ],
});

// Configuração do middleware Morgan para logs HTTP
export const httpLogger = morgan("combined", {
  stream: fs.createWriteStream(logFilePath, { flags: "a" }),
});

// Middleware de erro para capturar e logar erros
export function errorLogger(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error(
    `${err.message} - ${err.stack} - ${req.originalUrl} - ${req.method} - ${req.ip}`
  );
  res.status(500).json({ message: "Algo deu errado" });
}
