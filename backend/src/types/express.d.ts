import { UserEntity } from "../models/User";

/**
 * @description Sobrescreve a interface Request do Express para adicionar o usuário
 */
declare global {
  namespace Express {
    interface Request {
      user?: UserEntity;
    }
  }
}
