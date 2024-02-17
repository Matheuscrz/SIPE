import winston, { createLogger, format, transports } from "winston";
import morgan from "morgan";
import express from "express";

interface LoggerOptions {
  level: string;
  logToConsole: boolean;
  logToFile: boolean;
  fileLogPath: string;
  errorLogPath: string;
}

export class LoggerManager {
  private static logger: winston.Logger;

  /**
   * Configura o logger com as opções fornecidas.
   * @param options - Opções de configuração do logger.
   */
  static configure(options: LoggerOptions): void {
    // Formato de log
    const logFormat = format.combine(
      format.timestamp(),
      format.errors({ stack: true }),
      format.splat(),
      format.json()
    );

    const transportOptions: winston.transport[] = [];

    // Adicionar transporte para log no console, se habilitado
    if (options.logToConsole) {
      transportOptions.push(new transports.Console());
    }

    // Adicionar transporte para log em arquivo, se habilitado
    if (options.logToFile) {
      transportOptions.push(
        new transports.File({ filename: options.fileLogPath, level: "info" })
      );
      transportOptions.push(
        new transports.File({ filename: options.errorLogPath, level: "error" })
      );
    }

    // Criar o logger com as configurações fornecidas
    this.logger = createLogger({
      level: options.level,
      format: logFormat,
      transports: transportOptions,
    });
  }

  /**
   * Obtém o logger configurado. Lança um erro se o logger não estiver inicializado.
   * @returns O logger configurado.
   */
  static getLogger(): winston.Logger {
    if (!this.logger) {
      throw new Error(
        "Logger não inicializado. Chame LoggerManager.configure() antes de acessar o logger."
      );
    }
    return this.logger;
  }

  /**
   * Configura o middleware de logging para express.
   * @param app - Instância do aplicativo Express.
   */
  static setupRequestLogging(app: express.Application): void {
    app.use(
      morgan("combined", {
        stream: { write: (message) => this.logger.info(message.trim()) },
      })
    );
  }

  /**
   * Registra um log de erro no formato padrão.
   * @param error - O objeto de erro.
   * @param message - Mensagem adicional de erro.
   * @param additionalInfo - Informações adicionais para serem registradas no log.
   */
  static logError(
    error: Error,
    message?: string,
    additionalInfo?: { [key: string]: any }
  ): void {
    this.logger.error(message || "Erro não especificado", {
      error: {
        message: error.message,
        stack: error.stack,
      },
      additionalInfo,
    });
  }

  /**
   * Registra um log de informação no formato padrão.
   * @param message - A mensagem a ser registrada.
   * @param additionalInfo - Informações adicionais para serem registradas no log.
   */
  static logInfo(
    message: string,
    additionalInfo?: { [key: string]: any }
  ): void {
    this.logger.info(message, { additionalInfo });
  }
}
