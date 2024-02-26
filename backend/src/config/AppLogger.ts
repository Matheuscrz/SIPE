import * as winston from "winston";
import { format as formatDate } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";

const logFormat = winston.format.printf(
  ({ level, message, timestamp, ...meta }) => {
    const logInfo = {
      level,
      message,
      timestamp: formatDate(
        utcToZonedTime(timestamp, "America/Sao_Paulo"),
        "yyyy-MM-dd HH:mm:ss"
      ),
      method: meta.method,
      url: meta.url,
      status: meta.status,
      responseTime: meta.responseTime,
      user: meta.user,
    };
    return JSON.stringify(logInfo);
  }
);

export class AppLogger {
  private static instance: winston.Logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(winston.format.timestamp(), logFormat),
    transports: [
      new winston.transports.File({
        filename: "./log/app.log",
        maxsize: 10 * 1024 * 1024,
        maxFiles: 5,
      }),
    ],
  });

  private constructor() {}

  public static getInstance(): winston.Logger {
    return AppLogger.instance;
  }

  private log(level: string, message: string, meta: any = {}, req?: any): void {
    const logInfo: any = {
      level,
      message,
      timestamp: new Date(),
    };
    if (req) {
      logInfo.method = req.method;
      logInfo.url = req.originalUrl;
      logInfo.user = req.user;
    }
    AppLogger.instance.log({ ...logInfo, ...meta });
  }
}
