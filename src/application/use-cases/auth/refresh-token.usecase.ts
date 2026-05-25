import { verifyRefreshToken, generateTokens } from "../../../shared/utils/jwt.ts";
import { UnauthorizedError } from "../../../shared/utils/AppError.ts";
import type { IUserRepository } from "../../../domain/repositories/user.repository.ts";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.ts";
import { ROLES } from "../../../shared/constants/index.ts";

export class RefreshTokenUseCase {
  constructor(
    private readonly _userRepo: IUserRepository,
    private readonly _therapistRepo: ITherapistRepository
  ) {}

  async execute(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedError("Refresh token missing");

    try {
      const payload = verifyRefreshToken(refreshToken);
      
      let user;
      if (payload.role === ROLES.USER) {
        user = await this._userRepo.findById(payload.id);
      } else if (payload.role === ROLES.THERAPIST) {
        user = await this._therapistRepo.findById(payload.id);
      } else if (payload.role === ROLES.ADMIN) {
        // Admin logic if needed, or just allow based on payload
        user = { id: payload.id, email: payload.email, role: payload.role };
      }

      if (!user) throw new UnauthorizedError("User not found");

      const tokens = generateTokens({
        id: payload.id,
        email: payload.email,
        role: payload.role as "user" | "therapist" | "admin"
      });

      return tokens;
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }
  }
}
