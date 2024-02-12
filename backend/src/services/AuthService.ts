import { UserModel } from "../models/UserModel";
import { JwtService } from "./JwtService";
import { PasswordUtils } from "../utils/PasswordUtils";
import { User, UserWithToken } from "../interfaces/User";

/**
 * Classe AuthService responsável pela lógica de autenticação.
 */
export class AuthService {
  /**
   * Autentica um usuário com as credenciais fornecidas.
   * @param cpf - CPF do usuário.
   * @param password - Senha do usuário.
   * @returns Objeto User ou null se a autenticação falhar.
   */
  static async authenticate(
    cpf: string,
    password: string
  ): Promise<UserWithToken | null> {
    try {
      const user = await UserModel.getUserByCpf(cpf);
      if (
        user &&
        (await PasswordUtils.comparePasswords(
          password,
          user.personalData.password
        ))
      ) {
        const accessToken = JwtService.generateAccessToken(user);
        const refreshToken = JwtService.generateRefreshToken(user);

        // Armazena o token refresh na tabela de tokens
        await UserModel.storeRefreshToken(user.id, refreshToken, new Date());

        return {
          ...user,
          accessToken,
          refreshToken,
        };
      }
      return null;
    } catch (error) {
      console.error("Erro durante autenticação:", error);
      return null;
    }
  }

  /**
   * Verifica a autenticação do usuário com base no token.
   * @param token - Token de acesso.
   * @returns Objeto User ou null se a verificação falhar.
   */
  static async verifyAuthentication(
    token: string
  ): Promise<User | null | undefined> {
    try {
      const user = await JwtService.verifyAccessToken(token);
      return user;
    } catch (error) {
      console.error("Erro durante verificação de autenticação:", error);
      return null;
    }
  }
}
