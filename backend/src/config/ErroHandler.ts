import { Response } from "express";
import { AppLogger } from "./AppLogger";

/**
 * Classe para tratamento de erros
 * @class ErrorHandler
 * @static
 * @exports ErrorHandler
 */
export class ErrorHandler {
  private static logError(message: string, error: any): void {
    AppLogger.getInstance().error(`${message}. Error: ${error}`);
  }

  private static formatError(message: string, statusCode: number): string {
    return `${message} (Status Code: ${statusCode})`;
  }

  /**
   * Trata erro genérico
   * @param res - Response
   * @param error - Erro
   */
  static handleGenericError(message: string, error: any): void {
    ErrorHandler.logError(message, error);
  }

  /**
   * Trata erro de requisição inválida
   * @param res - Response
   * @param message - Mensagem de erro
   */
  static handleBadRequest(res: Response, message: string): void {
    ErrorHandler.logError("Requisição inválida", new Error(message));
    res.status(400).send(ErrorHandler.formatError(message, 400));
  }

  /**
   * Trata erro de não autorizado
   * @param res - Response
   * @param message - Mensagem de erro
   */
  static handleUnauthorized(res: Response, message: string): void {
    ErrorHandler.logError("Não autorizado", new Error(message));
    res.status(401).send(ErrorHandler.formatError(message, 401));
  }

  /**
   * Trata erro de acesso proibido
   * @param res - Response
   * @param message - Mensagem de erro
   */
  static handleForbidden(res: Response, message: string): void {
    ErrorHandler.logError("Acesso proibido", new Error(message));
    res.status(403).send(ErrorHandler.formatError(message, 403));
  }

  /**
   * Trata erro de recurso não encontrado
   * @param res - Response
   * @param message - Mensagem de erro
   */
  static handleNotFound(res: Response, message: string): void {
    ErrorHandler.logError("Recurso não encontrado", new Error(message));
    res.status(404).send(ErrorHandler.formatError(message, 404));
  }

  /**
   * Trata erro de conflito
   * @param res - Response
   * @param message - Mensagem de erro
   */
  static handleConflict(res: Response, message: string): void {
    ErrorHandler.logError("Conflito", new Error(message));
    res.status(409).send(ErrorHandler.formatError(message, 409));
  }

  /**
   * Trata erro de entidade não processável
   * @param res - Response
   * @param message - Mensagem de erro
   */
  static handleUnprocessableEntity(res: Response, message: string): void {
    ErrorHandler.logError("Entidade não processável", new Error(message));
    res.status(422).send(ErrorHandler.formatError(message, 422));
  }

  /**
   * Trata erro de muitas requisições
   * @param res - Response
   * @param message - Mensagem de erro
   */
  static handleTooManyRequests(res: Response, message: string): void {
    ErrorHandler.logError("Muitas requisições", new Error(message));
    res.status(429).send(ErrorHandler.formatError(message, 429));
  }

  /**
   * Trata erro de falha ao autenticar
   * @param res - Response
   * @param message - Mensagem de erro
   */
  static handleAuthenticationFailure(res: Response, message: string): void {
    ErrorHandler.logError("Falha ao autenticar", new Error(message));
    res.status(498).send(ErrorHandler.formatError(message, 498));
  }

  static handleTokenExpired(res: Response, message: string): void {
    ErrorHandler.logError("Token expirado", new Error(message));
    res.status(498).send(ErrorHandler.formatError(message, 498));
  }

  static handleTokenInvalid(res: Response, message: string): void {
    ErrorHandler.logError("Token inválido", new Error(message));
    res.status(498).send(ErrorHandler.formatError(message, 498));
  }

  static handleInternalServerError(res: Response, message: string): void {
    ErrorHandler.logError("Erro interno do servidor", new Error(message));
    res.status(500).send(ErrorHandler.formatError(message, 500));
  }
}
