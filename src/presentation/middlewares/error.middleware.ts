import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/utils/AppError.ts";
import { ResponseModel } from "../../shared/utils/response-model.ts";
import { logger } from "../../shared/utils/logger.ts";
import { HttpStatus } from "../../shared/constants/index.ts";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(ResponseModel.error(err.message, err.statusCode));
    return;
  }

  logger.error("Unhandled error:", err);
  console.error("DEBUG ERROR:", err);
  res.status(500).json(ResponseModel.error("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR));
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json(ResponseModel.error("Route not found", HttpStatus.NOT_FOUND));
};