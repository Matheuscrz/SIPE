import jwt, { Secret, SignOptions, VerifyOptions } from "jsonwebtoken";
import { RedisCache } from "../config/Redis";
import { TokenRevocationController } from "../controllers/TokenRevocationController";
import { User as UserType } from "../interfaces/User";

export default class JwtService {
  private static readonly secretKey: Secret =
    process.env.JWT_SECRET_KEY || "secret";
  private static readonly algorithm: string = "HS256";
  private static readonly issuer: string = "SIPE";

  private static generateToken(user: UserType, expiresIn: string): string {
    const payload = {
      id: user.id,
      personalData: user.personalData,
      employmentData: user.employmentData,
      permissions: user.permissions,
      iss: this.issuer,
    };

    const options: SignOptions = {
      expiresIn,
      algorithm: this.algorithm as jwt.Algorithm,
    };

    const token = jwt.sign(payload, this.secretKey, options);
    return token;
  }

  static generateAccessToken(user: UserType): string {
    return this.generateToken(user, "15m");
  }

  static generateRefreshToken(user: UserType): string {
    return this.generateToken(user, "7d");
  }

  //   static verifyToken(token: string): Promise<UserType | null | undefined> {
  //     const cachedUser = await RedisCache.get(token);
  //   }
}
