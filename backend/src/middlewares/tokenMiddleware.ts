import { Request, Response, NextFunction } from "express";
import { AppLogger } from "../config/AppLogger";
import { JwtService } from "../services/JwtService";

const verifyAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers["x-access-token"] as string;
    const refreshToken = req.headers["x-refresh-token"] as string;
    if (!token || !refreshToken) {
      res
        .status(401)
        .send("Token de acesso ou token de atualização não informados");
    } else {
      const isTokenValid = JwtService.verifyAccessToken(token, refreshToken);
      if (await isTokenValid) {
        next();
      } else {
        res.status(401).send("Token de acesso inválido");
      }
    }
  } catch (error) {
    AppLogger.getInstance().error(
      `Erro ao verificar token de acesso. Error: ${error}`
    );
    res.status(500).send("Erro interno do servidor");
  }
};

const verifyRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers["x-refresh-token"] as string;
    if (!token) {
      res.status(401).send("Token de atualização não informado");
    } else {
      const isTokenValid = JwtService.verifyRefreshToken(token);
      if (await isTokenValid) {
        next();
      } else {
        res.status(401).send("Token de atualização inválido");
      }
    }
  } catch (error) {
    AppLogger.getInstance().error(
      `Erro ao verificar token de atualização. Error: ${error}`
    );
    res.status(500).send("Erro interno do servidor");
  }
};
