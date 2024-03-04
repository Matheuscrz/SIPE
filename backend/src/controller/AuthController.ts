import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Request, Response, NextFunction } from "express";
import { JwtService } from "../services/JwtService";
import { UserModel } from "../models/UserModel";
import { User as UserEntity } from "../interfaces/User";
import { PasswordUtils } from "../utils/PasswordUtils";
import { UserUtils } from "../utils/UserUtils";

/**
 * Controller responsável por gerenciar a autenticação de usuários
 * @class AuthController
 */
export class AuthController {
  /**
   * Método que gerá os tokens de acesso e refresh e os retorna
   * @param req - Requisição
   * @param res - Resposta
   * @returns - Retorna um objeto com os tokens de acesso e refresh
   */
  static async generateTokens(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as UserEntity | undefined;
      if (!user) {
        res.status(401).json({ message: "Usuário não autenticado" });
        return;
      }
      const personalData = UserUtils.transformPersonalData(user);
      const employmentData = UserUtils.transformEmploymentData(user);
      const userPermissions = UserUtils.transformUserPermissions(user);

      const formattedUser: UserEntity = {
        id: user.id,
        personalData,
        employmentData,
        permissions: userPermissions,
        active: user.active,
      };
      const { accessToken, refreshToken } = await JwtService.generateTokens(
        formattedUser
      );
      await UserModel.storeRefreshToken(user.id, refreshToken, new Date());
      await UserModel.storeAccessToken(user.id, accessToken);
      res.json({
        success: true,
        message: "Login bem-sucedido",
        accessToken,
        refreshToken,
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Erro ao gerar tokens", error });
    }
  }

  /**
   * Método que realiza o logout do usuário e remove o token de refresh
   * @param req - Requisição
   * @param res - Resposta
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const removed = await UserModel.removeRefreshToken(refreshToken);
      if (removed) {
        res.json({ success: true, message: "Logout realizado com sucesso" });
      } else {
        res
          .status(404)
          .json({ success: false, message: "Token não encontrado" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Erro ao realizar logout", error });
    }
  }
}
