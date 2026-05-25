import type { IUserRepository } from "../../../domain/repositories/user.repository.ts";
import { verifyGoogleToken } from "../../../infrastructure/external-services/google.service.ts";
import { generateTokens } from "../../../shared/utils/jwt.ts";
import { AppError } from "../../../shared/utils/AppError.ts";
import { ROLES, USER_STATUS } from "../../../shared/constants/index.ts";

import type { ILoginUserUseCase, ILoginResponse } from "../../interfaces/auth/IAuthUseCase.ts";

export class GoogleAuthUseCase implements ILoginUserUseCase {
  constructor(private readonly _userRepo: IUserRepository) {}

  async execute({ idToken }: { idToken: string }): Promise<ILoginResponse> {
    const googleUser = await verifyGoogleToken(idToken);

    let user = await this._userRepo.findByEmail(googleUser.email);

    if (user) {
      if (user.status === USER_STATUS.BLOCKED) throw new AppError("Your account has been blocked", 403);

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

    const tokens = generateTokens({ id: user!.id, email: user!.email, role: ROLES.USER });
    return { tokens, user: user! };
  }
}
