import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import type { ResetPasswordDTO } from "../../dto/auth/user.dto.ts";
import { AppError, NotFoundError } from "../../../shared/utils/AppError.ts";
import { HttpStatus } from "../../../shared/constants/index.ts";

// Interfaces
import type { IUserRepository } from "../../../domain/repositories/user.repository.ts";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.ts";
import type { IOtpCacheRepository } from "../../../domain/repositories/otp-cache.repository.ts";
import type { IResetPasswordUseCase } from "../../interfaces/auth/IAuthUseCase.ts";
import type { IPasswordHasher } from "../../interfaces/services/IPasswordHasher.ts";

@injectable()
export class ResetPasswordUseCase implements IResetPasswordUseCase {
  constructor(
    @inject(TYPES.UserRepository) private readonly _userRepo: IUserRepository,
    @inject(TYPES.TherapistRepository) private readonly _therapistRepo: ITherapistRepository,
    @inject(TYPES.OtpCacheRepository) private readonly _otpCacheRepo: IOtpCacheRepository,
    @inject(TYPES.PasswordHasher) private readonly _passwordHasher: IPasswordHasher
  ) {}

  async execute({ dto, type = "user" }: { dto: ResetPasswordDTO; type?: "user" | "therapist" }): Promise<void> {
    let account;
    if (type === "user") {
      account = await this._userRepo.findByEmail(dto.email);
      if (!account) throw new NotFoundError("User");
    } else {
      account = await this._therapistRepo.findByEmail(dto.email);
      if (!account) throw new NotFoundError("Therapist");
    }

    const cachedOtp = await this._otpCacheRepo.getOtp(dto.email);
    if (!cachedOtp) {
      throw new AppError("OTP has expired or was not requested. Request a new one.", HttpStatus.GONE);
    }
    if (cachedOtp !== dto.otp) {
      throw new AppError("Invalid OTP", HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await this._passwordHasher.hash(dto.newPassword);

    if (type === "user") {
      await this._userRepo.update(account.id, { password: hashedPassword });
    } else {
      await this._therapistRepo.resetPassword(dto.email, hashedPassword);
    }

    await this._otpCacheRepo.deleteOtp(dto.email);
  }
}
