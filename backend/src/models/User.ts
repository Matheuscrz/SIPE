// Interface representando a entidade de usuário no sistema
export interface UserEntity {
  id: string;
  username: string;
  password: string;
  login_attempts: number;
  max_login_attempts: number;
}
