import passport from "passport";
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  VerifiedCallback,
} from "passport-jwt";
import { UserModel } from "../models/UserModel";
import { JwtService } from "../services/JwtService";

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: ExtractJwt.fromHeader(
        "x-refresh-token"
      ) as unknown as string,
      issuer: "SIPE",
    },
    async (jwtPayload: any, done: VerifiedCallback) => {
      try {
        const user = await UserModel.getById(jwtPayload.id);
        if (!user) {
          return done(null, false);
        }
        try {
          await JwtService.verifyAccessToken(
            jwtPayload.token,
            jwtPayload.refreshToken
          );
          return done(null, user);
        } catch (accessTokenError) {
          if (accessTokenError.name === "TokenExpiredError") {
            const newAccessToken = JwtService.generateAccessToken(
              jwtPayload.refreshToken
            );
            return done(null, user, { accessToken: newAccessToken });
          } else {
            return done(accessTokenError, false);
          }
        }
      } catch (error) {
        return done(error, false);
      }
    }
  )
);
