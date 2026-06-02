import type { IUserRepository } from "../../../domain/repositories/user.repository.ts";
import { AppError } from "../../../shared/utils/AppError.ts";
import { HttpStatus } from "../../../shared/constants/index.ts";
import type { IPasswordHasher } from "../../interfaces/services/IPasswordHasher.ts";

export class ChangeUserPasswordUseCase {
  constructor(
    private readonly _userRepo: IUserRepository,
    private readonly _passwordHasher: IPasswordHasher
  ) {}

  async execute(userId: string, currentPasswordRaw: string, newPasswordRaw: string) {
    const user = await this._userRepo.findById(userId);
    if (!user) {
      throw new AppError("User not found", HttpStatus.NOT_FOUND);
    }

    if (user.isGoogleAuth) {
      throw new AppError("Users authenticated via Google cannot change their password here.", HttpStatus.BAD_REQUEST);
    }

    if (!user.password) {
      throw new AppError("User has no password set.", HttpStatus.BAD_REQUEST);
    }

    const isMatch = await this._passwordHasher.compare(currentPasswordRaw, user.password);
    if (!isMatch) {
      throw new AppError("Incorrect current password", HttpStatus.UNAUTHORIZED);
    }

    const hashedPassword = await this._passwordHasher.hash(newPasswordRaw);
    await this._userRepo.update(userId, { password: hashedPassword });

    return true;
  }
}
