import { Request, Response, NextFunction } from "express";
import JwtService from "../utils/JwtUtils";
import { User } from "../models/User";

interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authenticationMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    const user = await JwtService.verifyToken(token);
    if (user) {
      req.user = user;
      next();
    } else {
      res.status(401).json({ message: "Invalid token" });
    }
  } else {
    res.status(401).json({ message: "No token provided" });
  }
};

export const authorizationMiddleware =
  (permission: string) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const user = req.user;
    if (user && user.permissions.permission === permission) {
      next();
    } else {
      res.status(403).json({ message: "Permission denied" });
    }
  };
