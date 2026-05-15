import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../../shared/utils/jwt.js";
import { UnauthorizedError, ForbiddenError } from "../../shared/utils/AppError.js";
import type { Role } from "../../shared/constants/index.js";

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: Role };
}

export const authenticate = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  const token = req.cookies?.accessToken;
  if (!token) return next(new UnauthorizedError("Access token missing"));

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired token"));
  }
};

export const authorize = (...roles: Role[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(new UnauthorizedError());
    if (!roles.includes(req.user.role)) return next(new ForbiddenError("Insufficient permissions"));
    next();
  };
};