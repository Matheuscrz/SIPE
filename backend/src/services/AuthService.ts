import { UserModel } from "../models/UserModel";
import { TokenModel } from "../models/TokenModel";
import bcrypt from "bcrypt";
import { JwtService } from "./JwtService";
import { ErrorHandler } from "../config/ErrorHandler";

/**
 * @class AuthService
 * @description Classe de serviço que contém os métodos para autenticação de usuários
 */
export class AuthService {
  /**
   * @param cpf CPF do usuário
   * @param password Senha do usuário
   * @returns {Promise<{ userId: string; accessToken: string; refreshToken: string } | null>} Objeto com ID do usuário, token de acesso e token de atualização ou null se não autenticado
   * @throws {ErrorHandler} Erro durante o processo de login
   * @description Método para autenticar um usuário
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
    } catch (error: any) {
      console.error("Erro durante o processo de login:", error);
      throw new ErrorHandler(error.code, error.message, error);
    }
  }

  /**
   * @param token Token de atualização
   * @returns {Promise<void>} Retorna void
   * @throws {ErrorHandler} Erro durante o processo de logout
   * @description Método para deslogar um usuário
   */
  public static async logout(token: string): Promise<void> {
    try {
      await TokenModel.removeToken(token);
    } catch (error: any) {
      console.error("Erro durante o processo de logout:", error);
      throw new ErrorHandler(error.code, error.message, error);
    }
  }
}
