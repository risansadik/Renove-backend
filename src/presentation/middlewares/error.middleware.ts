import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/utils/AppError.ts";
import { ResponseModel } from "../../shared/utils/response-model.ts";
import { logger } from "../../shared/utils/logger.ts";
import { HttpStatus } from "../../shared/constants/index.ts";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    const body = {
      ...ResponseModel.error(err.message, err.statusCode),
      ...(err.details ? { errors: err.details } : {}),
    };

    res.status(err.statusCode).json(body);
    return;
  }

  if (req.originalUrl === "/api/payments/webhook") {
    logger.error("Webhook Error", { message: err.message });
    res.status(HttpStatus.BAD_REQUEST).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    res.status(HttpStatus.UNAUTHORIZED).json(ResponseModel.error("Invalid or expired token", HttpStatus.UNAUTHORIZED));
    return;
  }

  if (err instanceof SyntaxError) {
    res.status(HttpStatus.BAD_REQUEST).json(ResponseModel.error("Invalid JSON payload", HttpStatus.BAD_REQUEST));
    return;
  }

  logger.error("Unhandled error:", err);
  console.error("DEBUG ERROR:", err);
  res.status(500).json(ResponseModel.error("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR));
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json(ResponseModel.error("Route not found", HttpStatus.NOT_FOUND));
};
