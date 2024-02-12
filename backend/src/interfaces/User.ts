/**
 * Enum Gender representa os possíveis valores de gênero para um usuário.
 */
export enum Gender {
  Masculino = "Masculino",
  Feminino = "Feminino",
  Outros = "Outros",
}

/**
 * Enum Permission representa os níveis de permissão para um usuário.
 */
export enum Permission {
  Normal = "Normal",
  RH = "RH",
  Admin = "Admin",
}

/**
 * Interface PersonalData representa informações pessoais de um usuário.
 */
export interface PersonalData {
  name: string; // Nome do usuário.
  password: string; // Senha do usuário.
  cpf: string; // CPF do usuário.
  pis: string; // PIS do usuário.
  pin: string; // PIN do usuário.
  gender: Gender; // Gênero do usuário (Masculino, Feminino, Outros).
  birthDate: Date; // Data de nascimento do usuário.
}

/**
 * Interface EmploymentData representa informações de emprego de um usuário.
 */
export interface EmploymentData {
  departmentId: string; // Identificador do departamento onde o usuário está empregado.
  roleId: string; // Identificador da função (cargo) do usuário.
  workScheduleId: string; // Identificador do horário de trabalho do usuário.
  hiringDate: Date; // Data de contratação do usuário.
  regime: "CLT" | "PJ"; // Regime de contratação do usuário (CLT ou PJ).
}

/**
 * Interface UserPermissions representa as permissões e informações de login de um usuário.
 */
export interface UserPermissions {
  permission: Permission; // Nível de permissão do usuário (Normal, RH, Admin).
  createdAt: Date; // Data de criação do registro do usuário.
  loginAttempts: number; // Número de tentativas de login do usuário.
  maxLoginAttempts: number; // Número máximo permitido de tentativas de login.
}

/**
 * Interface User representa a estrutura completa de dados para um usuário.
 */
export interface User {
  id: string; // Identificador único do usuário.
  personalData: PersonalData; // Informações pessoais do usuário.
  employmentData: EmploymentData; // Informações de emprego do usuário.
  permissions: UserPermissions; // Permissões e informações de login do usuário.
}

/**
 * Interface AccessToken representa um token de acesso JWT.
 */
export interface AccessToken {
  accessToken: string;
}

/**
 * Interface AccessToken representa um token de acesso JWT.
 */
export interface RefreshToken {
  refreshToken: string;
}

/**
 * Interface UserWithToken representa a estrutura completa de dados para um usuário
 * incluindo um token de acesso.
 */
export interface UserWithToken extends User, AccessToken, RefreshToken {}
