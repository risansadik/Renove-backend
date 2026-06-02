import type { NextFunction, Request, Response } from "express";

export const normalizeArrayFields = (fields: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    fields.forEach((field) => {
      const value = req.body[field];
      if (typeof value !== "string") return;

      const trimmed = value.trim();
      req.body[field] = trimmed.startsWith("[")
        ? JSON.parse(trimmed)
        : trimmed.split(",").map((item) => item.trim()).filter(Boolean);
    });

    next();
  };
};
