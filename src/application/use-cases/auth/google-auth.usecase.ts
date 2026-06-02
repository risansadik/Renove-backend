import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import type { IUserRepository } from "../../../domain/repositories/user.repository.ts";
import type { IGoogleService } from "../../interfaces/services/IGoogleService.ts";
import { AppError } from "../../../shared/utils/AppError.ts";
import { HttpStatus, ROLES, USER_STATUS } from "../../../shared/constants/index.ts";
import type { IGoogleAuthUseCase, ILoginResponse } from "../../interfaces/auth/IAuthUseCase.ts";
import type { ITokenService } from "../../interfaces/services/ITokenService.ts";

@injectable()
export class GoogleAuthUseCase implements IGoogleAuthUseCase {
  constructor(
    @inject(TYPES.UserRepository) private readonly _userRepo: IUserRepository,
    @inject(TYPES.GoogleService) private readonly _googleService: IGoogleService,
    @inject(TYPES.TokenService) private readonly _tokenService: ITokenService
  ) {}

  async execute({ idToken }: { idToken: string }): Promise<ILoginResponse> {
    const googleUser = await this._googleService.verifyGoogleToken(idToken);

    let user = await this._userRepo.findByEmail(googleUser.email);

    if (user) {
      if (user.status === USER_STATUS.BLOCKED) throw new AppError("Your account has been blocked", HttpStatus.FORBIDDEN);

      if (!user.isGoogleAuth) {
        user = await this._userRepo.update(user.id, { isGoogleAuth: true, isVerified: true });
        user = (await this._userRepo.findByEmail(googleUser.email))!;
      }
    } else {
      user = await this._userRepo.create({
        name: googleUser.name,
        email: googleUser.email,
        isGoogleAuth: true,
        isVerified: true,
        status: USER_STATUS.ACTIVE,
      });
    }

    const tokens = this._tokenService.generateTokens({ id: user!.id, email: user!.email, role: ROLES.USER });
    return { tokens, user: user! };
  }
}
