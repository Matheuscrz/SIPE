import { Request, Response, NextFunction } from "express";
import { AppLogger } from "../config/AppLogger";

/**
 * @param req - requisição
 * @param res - resposta
 * @param next - próximo middleware
 * @returns void
 * @description Middleware para log de requisições
 */
const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const logger = AppLogger.getInstance().info(
      `Solicitação ${req.method} para ${req.originalUrl} em ${new Date()}`
    );
    next();
  } catch (error) {
    AppLogger.getInstance().error(`Erro no middleware de log. Erro: ${error}`);
  }
};

export default loggerMiddleware;
