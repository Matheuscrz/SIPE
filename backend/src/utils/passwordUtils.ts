import bcrypt from "bcrypt";

export class PasswordUtils {
  private static readonly saltRounds: number = 10;

  /**
   * Hashes a password using bcrypt.
   * @param password - The plain text password to hash.
   * @param saltRounds - The number of salt rounds for bcrypt hashing.
   * @returns A promise that resolves to the hashed password.
   */
  static async hashPassword(
    password: string,
    saltRounds: number = this.saltRounds
  ): Promise<string> {
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Compares a plain text password with a hashed password.
   * @param password - The plain text password to compare.
   * @param hashedPassword - The hashed password to compare against.
   * @returns A promise that resolves to a boolean indicating whether the passwords match.
   */
  static async comparePasswords(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Validates a password based on specific criteria.
   * @param password - The password to validate.
   * @returns An array of strings containing error messages or an empty array if the password is valid.
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
