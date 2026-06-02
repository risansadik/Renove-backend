import type { Response, NextFunction } from "express";
import type { ITherapistRepository } from "../../domain/repositories/therapist.repository.ts";
import type { IUserRepository } from "../../domain/repositories/user.repository.ts";
import type { ITokenService } from "../../application/interfaces/services/ITokenService.ts";
import { UnauthorizedError, ForbiddenError } from "../../shared/utils/AppError.ts";
import type { Role } from "../../shared/constants/index.ts";
import { THERAPIST_STATUS, USER_STATUS } from "../../shared/constants/index.ts";
import type { AuthRequest } from "../../shared/types/express.ts";
import { asyncHandler } from "./async-handler.middleware.ts";

export type { AuthRequest };

interface AuthMiddlewareDependencies {
  tokenService: ITokenService;
  userRepository: IUserRepository;
  therapistRepository: ITherapistRepository;
}

export const createAuthMiddleware = ({
  tokenService,
  userRepository,
  therapistRepository,
}: AuthMiddlewareDependencies) => {
  const authenticate = asyncHandler<AuthRequest>(async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
    const token = req.cookies?.accessToken;
    if (!token) throw new UnauthorizedError("Access token missing");

    const decoded = tokenService.verifyAccessToken(token);
    req.user = decoded;

    if (decoded.role === "user") {
      const user = await userRepository.findById(decoded.id);
      if (!user) {
        throw new UnauthorizedError("User account no longer exists");
      }
      if (user.status === USER_STATUS.BLOCKED) {
        throw new ForbiddenError("Your account has been blocked");
      }
    } else if (decoded.role === "therapist") {
      const therapist = await therapistRepository.findById(decoded.id);
      if (!therapist) {
        throw new UnauthorizedError("Therapist account no longer exists");
      }
      if (therapist.status === THERAPIST_STATUS.REJECTED) {
        throw new ForbiddenError("Your account has been rejected or blocked");
      }
    }

    next();
  });

  const authorize = (...roles: Role[]) => {
    return (req: AuthRequest, _res: Response, next: NextFunction): void => {
      if (!req.user) throw new UnauthorizedError();
      if (!roles.includes(req.user.role)) throw new ForbiddenError("Insufficient permissions");
      next();
    };
  };

  return { authenticate, authorize };
};
