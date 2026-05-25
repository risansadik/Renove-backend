import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { ResponseModel } from "../../shared/utils/response-model.ts";
import { HttpStatus } from "../../shared/constants/index.ts";

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      console.log("VALIDATION FAILED:", { errors, body: req.body });
      res.status(HttpStatus.BAD_REQUEST).json({ ...ResponseModel.error("Validation failed"), errors });
      return;
    }
    req.body = result.data;
    next();
  };
};