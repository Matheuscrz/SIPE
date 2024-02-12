import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/AuthService";

// Adicionando a propriedade 'user' ao objeto Request do Express
declare module "express" {
  interface Request {
    user?: any;
  }
}

/**
 * Middleware para verificar se o usuário está autenticado.
 */
export const isAuthenticatedMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.headers.authorization?.split(" ")[1];

  if (!accessToken) {
    return res.status(401).json({ message: "Token de acesso não fornecido" });
  }

  try {
    const user = await AuthService.verifyAuthentication(accessToken);

    if (user) {
      req.user = user;
      return next();
    } else {
      return res.status(401).json({ message: "Token de acesso inválido" });
    }
  } catch (error) {
    console.error("Erro durante a verificação de autenticação:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};
