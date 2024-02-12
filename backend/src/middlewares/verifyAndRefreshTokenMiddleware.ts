import { Request, Response, NextFunction } from "express";
import { JwtService } from "../services/JwtService";

// Adicionando a propriedade 'user' ao objeto Request do Express
declare module "express" {
  interface Request {
    user?: any;
  }
}

/**
 * Middleware para verificar e renovar o token de acesso.
 */
export const verifyAndRefreshTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.headers.authorization?.split(" ")[1];

  if (!accessToken) {
    return res.status(401).json({ message: "Token de acesso não fornecido" });
  }

  try {
    // Verifica se o token de acesso é válido
    const user = await JwtService.verifyAccessToken(accessToken);

    if (user) {
      // Se o token de acesso for válido, adiciona o usuário à requisição
      req.user = user;
      return next();
    } else {
      // Se o token de acesso expirou, tenta renová-lo usando o token de refresh
      const refreshToken = req.cookies.refreshToken; // Supondo que o token de refresh seja enviado via cookie

      if (refreshToken) {
        const refreshedTokens = await JwtService.refreshTokens(refreshToken);

        if (refreshedTokens) {
          // Se a renovação for bem-sucedida, adiciona o usuário à requisição
          req.user = await JwtService.verifyAccessToken(
            refreshedTokens.accessToken
          );

          // Atualiza o cookie com o novo token de refresh
          res.cookie("refreshToken", refreshedTokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            expires: new Date(Date.now() + 604800000), // 7 dias
          });

          return next();
        }
      }

      // Se não for possível renovar o token, retorna 401
      return res
        .status(401)
        .json({ message: "Token de acesso expirado ou inválido" });
    }
  } catch (error) {
    console.error("Erro durante verificação e renovação de token:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};
