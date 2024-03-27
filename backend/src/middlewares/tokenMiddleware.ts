import { Request, Response, NextFunction } from "express";
import { AppLogger } from "../config/AppLogger";
import { JwtService } from "../services/JwtService";
import { Permission } from "../interfaces/User";

/**
 * @param req - Requisição
 * @param res - Resposta
 * @param next - Próximo middleware
 * @returns
 * @description Verifica e renova o token de acesso
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
      return res.status(302).redirect("/login");
    }

    const isTokenValid = await JwtService.verifyAccessToken(
      accessToken,
      refreshToken
    );

    if (isTokenValid) {
      const decodedToken: any = JwtService.decodeToken(accessToken);
      const userPermission: Permission = decodedToken.permission;

      if (!checkUserPermission(userPermission, req.path)) {
        return res
          .status(403)
          .send("Usuário não tem permissão para acessar este recurso");
      }

      next();
    } else {
      const isRefreshTokenValid = await JwtService.verifyRefreshToken(
        refreshToken
      );

      if (isRefreshTokenValid) {
        const newAccessToken = await JwtService.generateAccessToken(
          refreshToken
        );
        req.headers["x-access-token"] = newAccessToken;
        next();
      } else {
        res.status(302).redirect("/login");
      }
    }
  } catch (error) {
    AppLogger.getInstance().error(
      `Erro ao verificar e renovar token de acesso. Error: ${error}`
    );
    res.status(500).send("Erro interno do servidor");
  }
};

/**
 * @param userPermission Tipo de permissão do usuário
 * @param route Rota que o usuário está tentando acessar
 * @returns true se o usuário tem permissão para acessar a rota, false caso contrário
 * @description Verifica se o tipo de permissão do usuário permite acessar a rota
 */
const checkUserPermission = (
  userPermission: Permission,
  route: string
): boolean => {
  const routePermissionMap: Record<string, Permission[]> = {
    "/home": [Permission.Normal, Permission.RH, Permission.Admin],
  };

  const allowedUserPermissions = routePermissionMap[route];
  if (!allowedUserPermissions) return true;
  return allowedUserPermissions.includes(userPermission);
};
