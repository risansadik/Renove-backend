import winston from "winston";
import TransportStream from "winston-transport";
import { ILogger } from "../../application/interfaces/services/ILoggerService";
import { injectable } from "inversify";

const { combine, timestamp, errors, colorize, printf } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

class LokiHttpTransport extends TransportStream {
  private readonly host: string;
  private readonly auth: string;
  private readonly labels: Record<string, string>;

  constructor(opts: {
    host: string;
    userId: string;
    apiToken: string;
    labels: Record<string, string>;
  }) {
    super();
    this.host = opts.host;
    this.auth = Buffer.from(`${opts.userId}:${opts.apiToken}`).toString("base64");
    this.labels = opts.labels;
  }

  log(info: { level: string; message: string; stack?: string }, callback: () => void): void {
    const stream = {
      stream: { ...this.labels, level: info.level },
      values: [[`${Date.now() * 1_000_000}`, info.stack || info.message]],
    };

    fetch(`${this.host}/loki/api/v1/push`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${this.auth}`,
      },
      body: JSON.stringify({ streams: [stream] }),
    }).catch((err) => {
      console.error("[Loki] Push error:", err);
    });

    callback();
  }
}

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
        new LokiHttpTransport({
          host: process.env.LOKI_HOST,
          userId: process.env.LOKI_USER_ID,
          apiToken: process.env.LOKI_API_TOKEN,
          labels: { app: "renove", env: process.env.NODE_ENV ?? "development" },
        })
      );
    }

    this.instance = winston.createLogger({
     level: process.env.NODE_ENV === "production" ? "info" : "debug",
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