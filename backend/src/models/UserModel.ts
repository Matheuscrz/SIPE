import { Database } from "../config/Database";
import {
  User,
  PersonalData,
  EmploymentData,
  UserPermissions,
} from "../interfaces/User";
import { PasswordUtils } from "../utils/PasswordUtils";
import { LoggerManager } from "../services/LoggerManager";

export class UserModel {
  /**
   * Obtém um usuário pelo ID.
   * @param userId - ID do usuário.
   * @returns Uma Promise que resolve para o usuário encontrado ou null se não encontrado.
   */
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const result = await Database.query(
        "SELECT * FROM point.employees WHERE id = $1",
        [userId]
      );

      return result.rows.length > 0 ? this.mapRowToUser(result.rows[0]) : null;
    } catch (error) {
      LoggerManager.logError(error as Error, "Erro ao obter usuário por ID", {
        userId,
      });
      return null;
    }
  }

  /**
   * Obtém um usuário pelo CPF.
   * @param cpf - CPF do usuário.
   * @returns Uma Promise que resolve para o usuário encontrado ou null se não encontrado.
   */
  static async getUserByCpf(cpf: string): Promise<User | null> {
    try {
      const result = await Database.query(
        "SELECT * FROM point.employees WHERE cpf = $1",
        [cpf]
      );

      return result.rows.length > 0 ? this.mapRowToUser(result.rows[0]) : null;
    } catch (error) {
      LoggerManager.logError(error as Error, "Erro ao obter usuário por CPF", {
        cpf,
      });
      return null;
    }
  }

  /**
   * Atualiza o token de login para um usuário.
   * @param userId - ID do usuário.
   * @param loginTokenData - Dados do token de login a serem atualizados.
   * @returns Uma Promise que resolve após a conclusão da atualização.
   */
  static async updateLoginToken(
    userId: string,
    loginTokenData: { refreshToken: string; expiresAt: Date }
  ): Promise<void> {
    try {
      const result = await Database.query(
        "UPDATE point.login_tokens SET refresh_token = $1, expires_at = $2 WHERE user_id = $3",
        [loginTokenData.refreshToken, loginTokenData.expiresAt, userId]
      );

      if (result.rowCount === 0) {
        LoggerManager.logInfo(
          "Usuário não encontrado ao atualizar token de login",
          { userId }
        );
        throw new Error("Usuário não encontrado");
      }
    } catch (error) {
      LoggerManager.logError(
        error as Error,
        "Erro ao atualizar token de login do usuário",
        { userId, loginTokenData }
      );
      throw error;
    }
  }

  /**
   * Remove o token de login de um usuário.
   * @param userId - ID do usuário.
   * @returns Uma Promise que resolve após a conclusão da remoção.
   */
  static async removeLoginToken(userId: string): Promise<void> {
    try {
      await Database.query(
        "DELETE FROM point.login_tokens WHERE user_id = $1",
        [userId]
      );
    } catch (error) {
      LoggerManager.logError(
        error as Error,
        "Erro ao remover token de login do usuário",
        { userId }
      );
      throw error;
    }
  }

  /**
   * Obtém os dados do token de login de um usuário.
   * @param userId - ID do usuário.
   * @returns Uma Promise que resolve para os dados do token de login ou null se não encontrado.
   */
  static async getLoginTokenData(userId: string): Promise<{
    refreshToken: string;
    expiresAt: Date;
  } | null> {
    try {
      const result = await Database.query(
        "SELECT refresh_token, expires_at FROM point.login_tokens WHERE user_id = $1",
        [userId]
      );

      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      LoggerManager.logError(
        error as Error,
        "Erro ao obter dados do token de login",
        {
          userId,
        }
      );
      return null;
    }
  }

  /**
   * Cria um novo usuário.
   * @param user - Dados do usuário a serem criados.
   * @returns Uma Promise que resolve para o usuário recém-criado.
   */
  static async createUser(user: User): Promise<User> {
    const { personalData, employmentData, permissions } = user;

    try {
      // Hash da senha antes de armazenar no banco de dados
      personalData.password = await PasswordUtils.hashPassword(
        personalData.password
      );

      const result = await Database.query(
        "INSERT INTO point.employees (id, name, password, cpf, pis, pin, gender, birth_date, " +
          "department_id, roles_id, work_schedule_id, hiring_date, regime, permission, created_at, active, login_attempts, max_login_attempts) " +
          "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP, TRUE, 0, $15) RETURNING *",
        [
          user.id,
          personalData.name,
          personalData.password,
          personalData.cpf,
          personalData.pis,
          personalData.pin,
          personalData.gender,
          personalData.birthDate,
          employmentData.departmentId,
          employmentData.roleId,
          employmentData.workScheduleId,
          employmentData.hiringDate,
          employmentData.regime,
          permissions.permission,
          permissions.maxLoginAttempts,
        ]
      );

      return this.mapRowToUser(result.rows[0]);
    } catch (error) {
      LoggerManager.logError(error as Error, "Erro ao criar usuário", { user });
      throw error;
    }
  }

  /**
   * Atualiza dados de login para um usuário.
   * @param userId - ID do usuário.
   * @param loginData - Dados de login a serem atualizados.
   * @returns Uma Promise que resolve após a conclusão da atualização.
   */
  static async updateLoginData(
    userId: string,
    loginData: Partial<UserPermissions>
  ): Promise<void> {
    try {
      const result = await Database.query(
        "UPDATE point.employees SET login_attempts = $1 WHERE id = $2",
        [loginData.loginAttempts, userId]
      );

      if (result.rowCount === 0) {
        LoggerManager.logInfo(
          "Usuário não encontrado ao atualizar dados de login",
          { userId }
        );
        throw new Error("Usuário não encontrado");
      }
    } catch (error) {
      LoggerManager.logError(
        error as Error,
        "Erro ao atualizar dados de login do usuário",
        { userId, loginData }
      );
      throw error;
    }
  }

  /**
   * Mapeia uma linha do banco de dados para um objeto de usuário.
   * @param row - Linha do banco de dados.
   * @returns Um objeto de usuário mapeado.
   */
  private static mapRowToUser(row: any): User {
    const {
      id,
      name,
      password,
      cpf,
      pis,
      pin,
      gender,
      birth_date,
      department_id,
      roles_id,
      work_schedule_id,
      hiring_date,
      regime,
      permission,
      created_at,
      active,
      login_attempts,
      max_login_attempts,
    } = row;

    const personalData: PersonalData = {
      name,
      password,
      cpf,
      pis,
      pin,
      gender,
      birthDate: birth_date,
    };

    const employmentData: EmploymentData = {
      departmentId: department_id,
      roleId: roles_id,
      workScheduleId: work_schedule_id,
      hiringDate: hiring_date,
      regime,
    };

    const permissions: UserPermissions = {
      permission,
      createdAt: created_at,
      loginAttempts: login_attempts,
      maxLoginAttempts: max_login_attempts,
    };

    return {
      id,
      personalData,
      employmentData,
      permissions,
    };
  }
}
