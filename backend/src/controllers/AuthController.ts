import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";

export class AuthController {
  public static async login(req: Request, res: Response): Promise<void> {
    const { cpf, password } = req.body;

    const accessToken = await AuthService.authenticateUser(cpf, password);
    if (accessToken) {
      res.status(200).json({ accessToken });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  }
}
