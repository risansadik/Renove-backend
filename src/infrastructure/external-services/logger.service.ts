import winston from "winston";
import LokiTransport from "winston-loki";
import { ILogger } from "../../application/interfaces/services/ILoggerService";
import { injectable } from "inversify";

const { combine, timestamp, errors, colorize, printf } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

@injectable()
export class Logger implements ILogger {
  private readonly instance: winston.Logger;

  constructor() {
    const transports: winston.transport[] = [
      new winston.transports.Console({
        format: combine(
          timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
          errors({ stack: true }),
          colorize(),
          logFormat
        ),
      }),
      new winston.transports.File({
        filename: "logs/error.log",
        level: "error",
        format: combine(
          timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
          errors({ stack: true }),
          logFormat
        ),
      }),
      new winston.transports.File({
        filename: "logs/combined.log",
        format: combine(
          timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
          errors({ stack: true }),
          logFormat
        ),
      }),
    ];

    if (process.env.LOKI_HOST && process.env.LOKI_USER_ID && process.env.LOKI_API_TOKEN) {
      transports.push(
        new LokiTransport({
          host: process.env.LOKI_HOST,
          basicAuth: `${process.env.LOKI_USER_ID}:${process.env.LOKI_API_TOKEN}`,
          labels: { app: "renove", env: process.env.NODE_ENV ?? "development" },
          json: true,
          format: combine(
            timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            errors({ stack: true })
          ),
          onConnectionError: (err) => {
            console.error("[Loki] Connection error:", err);
          },
        })
      );
    }

    this.instance = winston.createLogger({
      level: process.env.NODE_ENV === "production" ? "warn" : "debug",
      transports,
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