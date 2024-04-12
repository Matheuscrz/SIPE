import { Permission } from "../interfaces/User";
/**
 * @constant routePermissionMap
 * @description Mapa de rotas e permissões
 */
export const routePermissionMap: Record<string, string[]> = {
  "/home": [Permission.Normal, Permission.RH, Permission.Admin],
  "/user": [Permission.Normal, Permission.RH, Permission.Admin],
  "/createuser": [Permission.RH],
};
