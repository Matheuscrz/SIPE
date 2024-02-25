import bcrypt from "bcrypt";

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

  /**
   * Valida uma senha de acordo com as regras de segurança.
   * @param password - A senha a ser validada.
   * @returns Uma promise que resolve para um array de strings contendo os erros encontrados.
   */
  static async validatePassword(password: string): Promise<string[]> {
    const errors: string[] = [];
    // Verifica se a senha tem pelo menos 8 caracteres.
    if (password.length < 8) {
      errors.push("A senha deve ter pelo menos 8 caracteres.");
    }
    // Verifica se a senha tem pelo menos um número.
    const digitRegex = /\d/;
    if (!digitRegex.test(password)) {
      errors.push("A senha deve conter pelo menos um número.");
    }
    // Verifica se a senha tem pelo menos uma letra.
    const letterRegex = /[a-zA-Z]/;
    if (!letterRegex.test(password)) {
      errors.push("A senha deve conter pelo menos uma letra.");
    }
    // Verifica se a senha tem pelo menos um caractere especial.
    const specialCharRegex = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    if (!specialCharRegex.test(password)) {
      errors.push("A senha precisa conter pelo menos um caractere especial.");
    }
    return errors;
  }
}
