import { Request, Response, NextFunction } from "express";
import { AppLogger } from "../config/AppLogger";
import { JwtService } from "../services/JwtService";

/**
 * Middleware para verificar e renovar o token de acesso
 * @param req - Requisição
 * @param res - Resposta
 * @param next - Próximo middleware
 */
export const verifyAndRefreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = req.headers["x-access-token"] as string;
    const refreshToken = req.headers["x-refresh-token"] as string;

    if (!accessToken || !refreshToken) {
      return res.status(401).send("Tokens não informados");
    }

    const isTokenValid = await JwtService.verifyAccessToken(
      accessToken,
      refreshToken
    );

    if (isTokenValid) {
      next();
    } else {
      const isRefreshTokenValid = await JwtService.verifyRefreshToken(
        refreshToken
      );

      if (isRefreshTokenValid) {
        const newAccessToken = await JwtService.generateAccessToken(
          refreshToken
        );

        // Adicionando o novo token ao corpo da resposta
        res.json({ accessToken: newAccessToken });
      } else {
        // Redirecionando para a página de login
        res.redirect(302, "/login");
      }
    }
  } catch (error) {
    AppLogger.getInstance().error(
      `Erro ao verificar e renovar token de acesso. Error: ${error}`
    );
    res.status(500).send("Erro interno do servidor");
  }
};
