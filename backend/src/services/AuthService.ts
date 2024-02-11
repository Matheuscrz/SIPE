import { User } from "../models/User";
import JwtUtils from "../utils/JwtUtils";
import { UserController } from "../controllers/UserController";

export class AuthService {
  public static async authenticateUser(
    cpf: string,
    password: string
  ): Promise<string | null> {
    const user = await UserController.getUserByCpfAndPassword(cpf, password);

    if (user) {
      const accessToken = JwtUtils.generateAccessToken(user);
      const refreshToken = JwtUtils.generateRefreshToken(user);

      return refreshToken;
    } else {
      return null;
    }
  }
}
