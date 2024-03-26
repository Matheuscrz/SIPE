/**
 * @class ErrorHandler
 * @extends {Error}
 * @description Classe de tratamento de erros
 */
export class ErrorHandler extends Error {
  public readonly code: string;
  public readonly details?: any;

  /**
   * @param code Código do erro
   * @param message Mensagem do erro
   * @param details Detalhes do erro
   * @description Construtor da classe
   */
  constructor(code: string, message: string, details?: any) {
    super(message);
    this.code = code;
    this.details = details;
  }
}
