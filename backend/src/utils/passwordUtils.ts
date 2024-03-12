import bcrypt from "bcrypt";

/**
 * Classe utilitária para criptografia de senhas
 * @class PasswordUtils
 */
export class PasswordUtils {
  private static readonly saltRounds: number = 10;

  /**
   * Criptografa uma senha com bcrypt.
   * @param password - A senha a ser criptografada.
   * @param saltRounds - O número de salt rounds a serem utilizados na criptografia.
   * @returns Uma promise que resolve para a senha criptografada.
   */
  static async hashPassword(
    password: string,
    saltRounds: number = this.saltRounds
  ): Promise<string> {
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Compara uma senha em texto plano com uma senha criptografada.
   * @param password - A senha em texto plano a ser comparada.
   * @param hashedPassword - A senha criptografada a ser comparada.
   * @returns Uma promise que resolve para um boolean indicando se as senhas são iguais.
   */
  static async comparePasswords(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
