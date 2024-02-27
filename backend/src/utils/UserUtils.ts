import { User as UserEntity } from "../interfaces/User";
import { Gender } from "../interfaces/User";
import { Permission } from "../interfaces/User";

/**
 * Classe UserUtils contém métodos utilitários para a entidade User.
 * @class UserUtils
 * @static
 * @exports UserUtils
 */
export class UserUtils {
  /**
   * Método validateUser valida uma entidade de usuário.
   * @param user - Entidade de usuário a ser validada.
   * @returns - Retorna true se a entidade de usuário for válida, caso contrário, retorna false.
   */
  static validateUser(user: UserEntity): boolean {
    if (
      !user.id ||
      !user.personalData ||
      !user.employmentData ||
      !user.permissions
    ) {
      return false;
    }

    if (
      typeof user.id !== "string" ||
      typeof user.personalData !== "object" ||
      typeof user.employmentData !== "object" ||
      typeof user.permissions !== "object"
    ) {
      return false;
    }
    if (!Object.values(Gender).includes(user.personalData.gender)) {
      return false;
    }
    if (!Object.values(Permission).includes(user.permissions.permission)) {
      return false;
    }
    return true;
  }
}
