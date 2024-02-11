import { Database } from "../config/Database";
import { User } from "../models/User";
import { comparePasswords } from "../utils/PasswordUtils";

export class UserController {
  public static async getUserByCpfAndPassword(
    cpf: string,
    password: string
  ): Promise<User | null> {
    try {
      const result = await Database.query("SELECT * FROM users WHERE cpf = ?", [
        cpf,
      ]);
      const user: User = result.rows[0];
      if (user && user.personalData.password) {
        const passwordMatch = await comparePasswords(
          password,
          user.personalData.password
        );
        if (passwordMatch) {
          return user;
        }
      }
      return null;
    } catch (error) {
      console.error("Error getting user by CPF and password:", error);
      return null;
    }
  }
}
