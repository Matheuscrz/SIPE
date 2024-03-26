import * as winston from "winston";
import { DateTime } from "luxon";

/**
 * @constant logFormat Formato do log
 * @type {winston.Logform.Format}
 * @default
 * @description Formato do log
 */
const logFormat = winston.format.printf(
  ({ level, message, timestamp, ...meta }) => {
    const logInfo = {
      level,
      message,
      timestamp: DateTime.fromJSDate(timestamp)
        .setZone("America/Sao_Paulo")
        .toFormat("yyyy-MM-dd HH:mm:ss"),
      method: meta.method,
      url: meta.url,
      status: meta.status,
      responseTime: meta.responseTime,
      user: meta.user,
    };
    return JSON.stringify(logInfo);
  }
);

/**
 * @class AppLogger
 * @description Singleton do winston para logar as requisições e respostas da aplicação
 */
export class AppLogger {
  /**
   * @private
   * @static
   * @type {winston.Logger}
   * @description Instância do winston
   */
  private static instance: winston.Logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(winston.format.timestamp(), logFormat),
    transports: [
      new winston.transports.File({
        filename: "./log/app.log",
        maxsize: 10 * 1024 * 1024,
        maxFiles: 5,
      }),
    ],
  });

  private constructor() {}

  /**
   * @static
   * @returns {winston.Logger} Retorna a instância do winston
   */
  public static getInstance(): winston.Logger {
    return AppLogger.instance;
  }

  /**
   * @param level Nível do log
   * @param message Mensagem do log
   * @param meta Metadados do log
   * @param req Requisição
   * @description Registra um log de requisição
   */
  private log(level: string, message: string, meta: any = {}, req?: any): void {
    const logInfo: any = {
      level,
      message,
      timestamp: new Date(),
    };
    if (req) {
      logInfo.method = req.method;
      logInfo.url = req.originalUrl;
      logInfo.user = req.user;
    }
    AppLogger.instance.log({ ...logInfo, ...meta });
  }
}
