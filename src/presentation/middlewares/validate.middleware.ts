import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { ValidationError } from "../../shared/utils/AppError.ts";

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      console.log("VALIDATION FAILED:", { errors, body: req.body });
      return next(new ValidationError("Validation failed", errors));
    }
    req.body = result.data;
    next();
  };
};
