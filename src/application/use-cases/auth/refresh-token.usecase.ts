import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens";
import { UnauthorizedError } from "../../../shared/utils/AppError";
import type { IUserRepository } from "../../../domain/repositories/user.repository";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository";
import { ROLES } from "../../../shared/constants/index";
import type { ITokenService } from "../../interfaces/services/ITokenService";

@injectable()
export class RefreshTokenUseCase {
  constructor(
    @inject(TYPES.UserRepository) private readonly _userRepo: IUserRepository,
    @inject(TYPES.TherapistRepository) private readonly _therapistRepo: ITherapistRepository,
    @inject(TYPES.TokenService) private readonly _tokenService: ITokenService
  ) {}

  async execute(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedError("Refresh token missing");

    const payload = this._tokenService.verifyRefreshToken(refreshToken);
    
    let user;
    if (payload.role === ROLES.USER) {
      user = await this._userRepo.findById(payload.id);
    } else if (payload.role === ROLES.THERAPIST) {
      user = await this._therapistRepo.findById(payload.id);
    } else if (payload.role === ROLES.ADMIN) {
      user = { id: payload.id, email: payload.email, role: payload.role };
    }

    if (!user) throw new UnauthorizedError("User not found");

    const tokens = this._tokenService.generateTokens({
      id: payload.id,
      email: payload.email,
      role: payload.role
    });

    return tokens;
  }
}
