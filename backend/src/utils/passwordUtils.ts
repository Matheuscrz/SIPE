import bcrypt from "bcrypt";

/**
 * @class PasswordUtils
 * @description Classe de utilitários para criptografia de senhas
 */
export class PasswordUtils {
  private static readonly saltRounds: number = 10;

  /**
   * @param password Senha
   * @param saltRounds Número de rounds de salt (padrão: 10)
   * @returns Uma promise que resolve para a senha criptografada.
   * @throws {Error} Erro ao criptografar a senha.
   * @description Método para criptografar uma senha com bcrypt.
   */
  static async hashPassword(
    password: string,
    saltRounds: number = this.saltRounds
  ): Promise<string> {
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * @param password Senha
   * @param hashedPassword Senha criptografada
   * @returns Uma promise que resolve para true se as senhas coincidirem, caso contrário, false.
   * @throws {Error} Erro ao comparar as senhas.
   * @description Método para comparar uma senha em texto plano com uma senha criptografada.
   */
  static async comparePasswords(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
