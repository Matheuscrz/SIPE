/**
 * @enum
 * @description Enumeração de gêneros
 */
export enum Gender {
  Masculino = "Masculino",
  Feminino = "Feminino",
  Outro = "Outro",
}

/**
 * @enum
 * @description Enumeração de permissões
 */
export enum Permission {
  Admin = "Admin",
  Normal = "Normal",
  RH = "RH",
}

/**
 * @interface User
 * @description Interface para Usuário que representa a estrutura de um usuário no banco de dados
 */
export interface User {
  [x: string]: any;
  id: string;
  name: string;
  password: string;
  cpf: string;
  pis: string;
  pin: string;
  gender: Gender;
  birth_date: string;
  role_name: string;
  work_schedule: string;
  hiring_date: string;
  permission: Permission;
  active: boolean;
  created_at: string;
}
