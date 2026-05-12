import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/utils/AppError.js";
import { ResponseModel } from "../../shared/utils/response-model.js";
import { logger } from "../../shared/utils/logger.js";
import { HttpStatus } from "../../shared/constants/index.js";

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
  res.status(500).json(ResponseModel.error("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR));
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json(ResponseModel.error("Route not found", HttpStatus.NOT_FOUND));
};