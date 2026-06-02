import type { ITherapistRepository } from "../../domain/repositories/therapist.repository.ts";
import type { IUserRepository } from "../../domain/repositories/user.repository.ts";
import type { ITokenService } from "../../application/interfaces/services/ITokenService.ts";
import { createAuthMiddleware } from "../../presentation/middlewares/auth.middleware.ts";
import { TYPES } from "../../shared/constants/tokens.ts";
import { appContainer } from "./container.ts";

const authMiddleware = createAuthMiddleware({
  tokenService: appContainer.get<ITokenService>(TYPES.TokenService),
  userRepository: appContainer.get<IUserRepository>(TYPES.UserRepository),
  therapistRepository: appContainer.get<ITherapistRepository>(TYPES.TherapistRepository),
});

export const { authenticate, authorize } = authMiddleware;
