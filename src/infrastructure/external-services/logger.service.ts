import winston from "winston";
import { ILogger } from "../../application/interfaces/services/ILoggerService.ts";
import { injectable } from "inversify";

const { combine, timestamp, colorize, printf, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});


@injectable()
export class Logger implements ILogger {
  private readonly instance: winston.Logger;

  constructor() {
    this.instance = winston.createLogger({
      level: process.env.NODE_ENV === "production" ? "warn" : "debug",
      format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }),
        colorize(),
        logFormat
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "logs/error.log", level: "error" }),
        new winston.transports.File({ filename: "logs/combined.log" }),
      ],
    });
  }

  debug(message: string, meta?: object): void {
    this.instance.debug(message, meta);
  }

  info(message: string, meta?: object): void {
    this.instance.info(message, meta);
  }

  warn(message: string, meta?: object): void {
    this.instance.warn(message, meta);
  }

  error(message: string, meta?: object): void {
    this.instance.error(message, meta);
  }
}