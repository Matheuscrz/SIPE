import { AppLogger } from "../config/AppLogger";
import { Database } from "../config/Database";
import { ErrorHandler } from "../error/ErrorHandler";
import { Permission as PermissionType } from "../interfaces/Permissions";
import { QueryResult } from "pg";

/**
 * @class PermissionModel
 * @description Classe de modelo que contém os métodos para manipulação de dados de permissões no banco de dados
 */
export class PermissionModel {
  private static readonly TABLE_PERMISSION = "point.permissions";

  /**
   * @function getPermissions
   * @description Retorna todas as permissões cadastradas no banco de dados
   */
  static async getPermissions(): Promise<PermissionType[]> {
    const query = `SELECT * FROM ${this.TABLE_PERMISSION}`;
    try {
      const result: QueryResult<any> = await Database.query(query);
      const permissions: PermissionType[] = result.rows.map(
        (PermissionFromDb) => {
          return {
            name: PermissionFromDb.name,
            can_manage_users: PermissionFromDb.can_manage_users,
            can_manage_departments: PermissionFromDb.can_manage_departments,
            can_manage_work_schedules:
              PermissionFromDb.can_manage_work_schedules,
            can_manage_roles: PermissionFromDb.can_manage_roles,
            can_manage_permissions: PermissionFromDb.can_manage_permissions,
            can_approve_absences: PermissionFromDb.can_approve_absences,
            can_generate_reports: PermissionFromDb.can_generate_reports,
            can_view_all_time_records:
              PermissionFromDb.can_view_all_time_records,
            can_manage_device: PermissionFromDb.can_manage_device,
            can_manage_company: PermissionFromDb.can_manage_company,
            created_at: PermissionFromDb.created_at,
          };
        }
      );
      AppLogger.getInstance().info(
        `Consulta getPermissions executada com sucesso`
      );
      return permissions;
    } catch (error: any) {
      let errorMessage = `Erro ao buscar permissões. ${error}`;
      AppLogger.getInstance().error(`Erro ao buscar permissões. `, error);
      throw new ErrorHandler(error.code, errorMessage);
    }
  }

  /**
   * @function getPermissionByName
   * @param name Nome da permissão
   * @description Retorna uma permissão específica
   */
  static async getPermissionByName(
    name: string
  ): Promise<PermissionType | null> {
    const query = `SELECT * FROM ${this.TABLE_PERMISSION} WHERE name = $1`;
    const values = [name];
    try {
      const result: QueryResult<any> = await Database.query(query, values);
      const permissionFromDb = result.rows.length ? result.rows[0] : null;
      const permission: PermissionType = {
        name: permissionFromDb.name,
        can_manage_users: permissionFromDb.can_manage_users,
        can_manage_departments: permissionFromDb.can_manage_departments,
        can_manage_work_schedules: permissionFromDb.can_manage_work_schedules,
        can_manage_roles: permissionFromDb.can_manage_roles,
        can_manage_permissions: permissionFromDb.can_manage_permissions,
        can_approve_absences: permissionFromDb.can_approve_absences,
        can_generate_reports: permissionFromDb.can_generate_reports,
        can_view_all_time_records: permissionFromDb.can_view_all_time_records,
        can_manage_device: permissionFromDb.can_manage_device,
        can_manage_company: permissionFromDb.can_manage_company,
        created_at: permissionFromDb.created_at,
      };
      AppLogger.getInstance().info(
        `Consulta getPermissionByName executada com sucesso. Nome: ${name}`
      );
      return permission;
    } catch (error: any) {
      let errorMessage = `Erro ao buscar permissão. ${error}`;
      AppLogger.getInstance().error(
        `Erro ao buscar permissão por nome. Nome: ${name}. `,
        error
      );
      throw new ErrorHandler(error.code, errorMessage);
    }
  }
}
