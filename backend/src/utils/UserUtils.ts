import {
  EmploymentData,
  PersonalData,
  User as UserEntity,
  UserPermissions,
} from "../interfaces/User";
import { Gender } from "../interfaces/User";

/**
 * Classe UserUtils contém métodos utilitários para a entidade User.
 * @class UserUtils
 * @static
 * @exports UserUtils
 */
export class UserUtils {
  /**
   * Função transformPersonalData transforma um objeto de usuário em um objeto do tipo PersonalData.
   * @param user - Entidade de usuário a ser transformada
   * @returns - Retorna um objeto do tipo PersonalData
   */
  static transformPersonalData(user: any): PersonalData {
    return {
      name: user.name,
      password: user.password,
      cpf: user.cpf,
      pis: user.pis,
      pin: user.pin,
      gender: user.gender,
      birthDate: user.birthDate,
    };
  }

  /**
   * Função transformEmploymentData transforma um objeto de usuário em um objeto do tipo EmploymentData.
   * @param user - Entidade de usuário a ser transformada
   * @returns - Retorna um objeto do tipo EmploymentData
   */
  static transformEmploymentData(user: any): EmploymentData {
    return {
      departmentId: user.department_id,
      roleId: user.roles_id,
      workScheduleId: user.work_schedule_id,
      hiringDate: user.hiring_date,
      regime: user.regime,
    };
  }

  /**
   * Função transformUserPermissions transforma um objeto de usuário em um objeto do tipo UserPermissions.
   * @param user - Entidade de usuário a ser transformada
   * @returns - Retorna um objeto do tipo UserPermissions
   */
  static transformUserPermissions(user: any): UserPermissions {
    return {
      permission: user.permission_id,
      createdAt: user.created_at,
    };
  }
}
