/**
 * Enum Gender representa os possíveis valores de gênero para um usuário.
 */
export enum Gender {
  Masculino = "Masculino", // Gênero Masculino
  Feminino = "Feminino", // Gênero Feminino
  Outro = "Outro", // Outros Gêneros
}

export enum Permission {
  Admin = "Admin",
  Normal = "Normal",
  RH = "RH",
}

/**
 * Interface User representa um usuário.
 */
export interface User {
  [x: string]: any;
  id: string; // Identificador do usuário
  name: string; // Nome do usuário
  password: string; // Senha do usuário
  cpf: string; // CPF do usuário
  pis: string; // PIS do usuário
  pin: string; // PIN do usuário
  gender: Gender; // Gênero do usuário
  birth_date: string; // Data de nascimento do usuário
  role_id: string; // Cargo do usuário
  work_schedule: string; // Horário de trabalho do usuário
  hiring_date: string; // Data de contratação do usuário
  permission: Permission; // Permissão do usuário
  active: boolean; // Indica se o usuário está ativo
  created_at: string; // Data de criação do usuário
}
