import { LoggerManager } from "../services/LoggerManager";

LoggerManager.configure({
  level: "info",
  logToConsole: true,
  logToFile: true,
  fileLogPath: "logs/combined.log",
  errorLogPath: "logs/error.log",
});
