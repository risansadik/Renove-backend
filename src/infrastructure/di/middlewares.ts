import type { ITherapistRepository } from "../../domain/repositories/therapist.repository";
import type { IUserRepository } from "../../domain/repositories/user.repository";
import type { ITokenService } from "../../application/interfaces/services/ITokenService";
import { createAuthMiddleware } from "../../presentation/middlewares/auth.middleware";
import { TYPES } from "../../shared/constants/tokens";
import { appContainer } from "./container";

const authMiddleware = createAuthMiddleware({
  tokenService: appContainer.get<ITokenService>(TYPES.TokenService),
  userRepository: appContainer.get<IUserRepository>(TYPES.UserRepository),
  therapistRepository: appContainer.get<ITherapistRepository>(TYPES.TherapistRepository),
});

export const { authenticate, authorize } = authMiddleware;
