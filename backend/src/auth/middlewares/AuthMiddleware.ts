import { Request, Response, NextFunction } from "express";
import { JwtUtils } from "../../utils/JwtUtils";
import { UserEntity } from "../../models/User";
import "../../types/express";

// Middleware de autenticação que verifica a presença e validade do token JWT
export const AuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Verificar se o cabeçalho Authorization está presente
    const authorization = req.headers.authorization;
    if (!authorization) {
      throw new Error("Authorization header is required");
    }

    // Extrair o token do cabeçalho Authorization
    const token = authorization.split("Bearer ")[1];
    if (!token) {
      throw new Error("Token is required");
    }

    // Verificar a validade do token usando a classe JwtUtils
    const decodedUser = JwtUtils.verifyToken(token) as UserEntity;

    // Adicionar o usuário decodificado ao objeto de solicitação (req) para uso posterior nas rotas
    req.user = decodedUser;

    // Chamar a próxima função no middleware chain
    next();
  } catch (error) {
    console.error(error);

    // Responder com status 401 (Unauthorized) em caso de erro de autenticação
    res.status(401).send({ message: "Unauthorized" });
  }
};
