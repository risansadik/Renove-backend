import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import { AppError, NotFoundError } from "../../../shared/utils/AppError.ts";
import { HttpStatus } from "../../../shared/constants/index.ts";

// Interfaces
import type { IUserRepository } from "../../../domain/repositories/user.repository.ts";
import type { IOtpCacheRepository } from "../../../domain/repositories/otp-cache.repository.ts";
import type { IVerifyOtpUseCase } from "../../interfaces/auth/IAuthUseCase.ts";
import type { VerifyOtpDTO } from "../../dto/auth/user.dto.ts";

@injectable()
export class VerifyOtpUseCase implements IVerifyOtpUseCase {
  constructor(
    @inject(TYPES.UserRepository) private readonly _userRepo: IUserRepository,
    @inject(TYPES.OtpCacheRepository) private readonly _otpCacheRepo: IOtpCacheRepository
  ) {}

  async execute(dto: VerifyOtpDTO): Promise<void> {
    const user = await this._userRepo.findByEmail(dto.email);
    if (!user) throw new NotFoundError("User");
    if (user.isVerified) throw new AppError("Email already verified");

    const cachedOtp = await this._otpCacheRepo.getOtp(dto.email);

    if (!cachedOtp) {
      throw new AppError("OTP has expired or was not requested. Request a new one.", HttpStatus.GONE);
    }

    if (cachedOtp !== dto.otp) {
      throw new AppError("Invalid OTP", HttpStatus.BAD_REQUEST);
    }

    await this._userRepo.verifyUser(dto.email);

    await this._otpCacheRepo.deleteOtp(dto.email);
  }
}