import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../../shared/utils/jwt.ts";
import { UnauthorizedError, ForbiddenError } from "../../shared/utils/AppError.ts";
import type { Role } from "../../shared/constants/index.ts";
import { UserModel } from "../../infrastructure/databases/schema/user.schema.ts";
import { TherapistModel } from "../../infrastructure/databases/schema/therapist.schema.ts";
import { USER_STATUS } from "../../shared/constants/index.ts";

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: Role };
}

export const authenticate = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies?.accessToken;
  if (!token) return next(new UnauthorizedError("Access token missing"));

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;

    if (decoded.role === "user") {
      const user = await UserModel.findById(decoded.id);
      if (!user) {
        return next(new UnauthorizedError("User account no longer exists"));
      }
      if (user.status === USER_STATUS.BLOCKED) {
        return next(new ForbiddenError("Your account has been blocked"));
      }
    } else if (decoded.role === "therapist") {
      const therapist = await TherapistModel.findById(decoded.id);
      if (!therapist) {
        return next(new UnauthorizedError("Therapist account no longer exists"));
      }
      if (therapist.status === "rejected") {
        return next(new ForbiddenError("Your account has been rejected or blocked"));
      }
    }

    next();
  } catch (err) {
    if (err instanceof ForbiddenError || err instanceof UnauthorizedError) {
      next(err);
    } else {
      next(new UnauthorizedError("Invalid or expired token"));
    }
  }
};

export const authorize = (...roles: Role[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(new UnauthorizedError());
    if (!roles.includes(req.user.role)) return next(new ForbiddenError("Insufficient permissions"));
    next();
  };
};