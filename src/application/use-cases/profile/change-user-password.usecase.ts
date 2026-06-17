import type { IUserRepository } from "../../../domain/repositories/user.repository.ts";
import { AppError } from "../../../shared/utils/AppError.ts";
import { HttpStatus } from "../../../shared/constants/index.ts";
import type { IPasswordHasher } from "../../interfaces/services/IPasswordHasher.ts";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import { IChangePasswordInput, IChangeUserPasswordUseCase } from "../../interfaces/profile/IProfileUseCase.ts";

@injectable()
export class ChangeUserPasswordUseCase implements IChangeUserPasswordUseCase{
  constructor(
    @inject(TYPES.UserRepository) private readonly _userRepo: IUserRepository,
    @inject(TYPES.PasswordHasher) private readonly _passwordHasher: IPasswordHasher
  ) {}

  async execute({id: userId , currentPasswordRaw, newPasswordRaw} : IChangePasswordInput) : Promise<boolean> {
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
      throw new AppError("Incorrect current password", HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await this._passwordHasher.hash(newPasswordRaw);
    await this._userRepo.update(userId, { password: hashedPassword });

    return true;
  }
}
