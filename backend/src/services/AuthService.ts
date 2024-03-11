import { User } from "../interfaces/User";
import { UserModel } from "../models/UserModel";
import { TokenModel } from "../models/TokenModel";
import bcrypt from "bcrypt";
import { JwtService } from "./JwtService";
import { addDays } from "date-fns";

export class AuthService {
  /**
   * Autentica um usuário e gera tokens de acesso e atualização
   * @param cpf - CPF do usuário
   * @param password - Senha do usuário
   * @returns {Promise<{ userId: string; accessToken: string; refreshToken: string } | null>} - Dados do usuário e tokens se a autenticação for bem-sucedida, caso contrário, retorna null
   */
  public static async login(
    cpf: string,
    password: string
  ): Promise<{
    userId: string;
    accessToken: string;
    refreshToken: string;
  } | null> {
    try {
      const user = await UserModel.getByCpf(cpf);
      if (user && (await bcrypt.compare(password, user.password))) {
        const tokens = await JwtService.generateTokens(user);
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7);
        await TokenModel.storeToken(
          user.id,
          tokens.refreshToken,
          expirationDate
        );

        return {
          userId: user.id,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        };
      }

      return null;
    } catch (error) {
      console.error("Erro durante o processo de login:", error);
      throw error;
    }
  }
}
