import type { IUserRepository } from "../../../domain/repositories/user.repository.js";
import { verifyGoogleToken } from "../../../infrastructure/external-services/google.service.js";
import { generateTokens } from "../../../shared/utils/jwt.js";
import { AppError } from "../../../shared/utils/AppError.js";
import { UserMapper } from "../../mappers/user.mapper.js";
import { ROLES, USER_STATUS } from "../../../shared/constants/index.js";

export class GoogleAuthUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(idToken: string) {
    const googleUser = await verifyGoogleToken(idToken);

    let user = await this.userRepo.findByEmail(googleUser.email);

    if (user) {
      if (user.status === USER_STATUS.BLOCKED) throw new AppError("Your account has been blocked", 403);

      if (!user.isGoogleAuth) {
        user = await this.userRepo.update(user.id, { isGoogleAuth: true, isVerified: true });
        user = (await this.userRepo.findByEmail(googleUser.email))!;
      }
    } else {
      user = await this.userRepo.create({
        name: googleUser.name,
        email: googleUser.email,
        isGoogleAuth: true,
        isVerified: true,
        status: USER_STATUS.ACTIVE,
      });
    }

    const tokens = generateTokens({ id: user!.id, email: user!.email, role: ROLES.USER });
    return { tokens, user: UserMapper.toPublicDTO(user!) };
  }
}
