import { Request, Response, NextFunction } from "express";
import { Permission } from "../interfaces/User";
import { JwtService } from "../services/JwtService";

/**
 * @constant routePermissionMap - Mapeamento de rotas e permissões necessárias
 */
const routePermissionMap: Record<string, Permission[]> = {
  "/home": [Permission.Normal, Permission.RH, Permission.Admin],
  "/user": [Permission.Normal, Permission.RH, Permission.Admin],
  "/createuser": [Permission.RH, Permission.Admin],
};

/**
 *
 * @param req Requisição
 * @param res Resposta
 * @param next Próximo middleware
 * @returns
 * @description Verifica se o usuário tem permissão para acessar a rota
 */
export const permissionMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.headers["x-access-token"] as string;
  const decodedToken: any = JwtService.decodeToken(accessToken);

  // Verifica se o token decodificado possui permissões atribuídas
  const userPermissions: Permission[] = decodedToken.permission;
  const route = req.path;

  const matchingRoute = Object.keys(routePermissionMap).find((routeKey) =>
    route.startsWith(routeKey)
  );

  if (matchingRoute) {
    const requiredPermissions = routePermissionMap[matchingRoute];
    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission)
    );

    if (hasPermission) {
      next();
    } else {
      res
        .status(403)
        .json({ message: "Usuário não tem permissão para acessar esta rota" });
    }
  } else {
    next();
  }
};
