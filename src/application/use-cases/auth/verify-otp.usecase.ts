import type { IUserRepository } from "../../../domain/repositories/user.repository.ts";
import type { VerifyOtpDTO } from "../../dto/auth/user.dto.ts";
import { AppError, NotFoundError } from "../../../shared/utils/AppError.ts";
import { isOtpExpired } from "../../../shared/utils/otp.ts";
import { HttpStatus } from "../../../shared/constants/index.ts";

import type { IVerifyOtpUseCase } from "../../interfaces/auth/IAuthUseCase.ts";

export class VerifyOtpUseCase implements IVerifyOtpUseCase {
  constructor(private readonly _userRepo: IUserRepository) {}

  async execute(dto: VerifyOtpDTO): Promise<void> {
    const user = await this._userRepo.findByEmail(dto.email);
    if (!user) throw new NotFoundError("User");
    if (user.isVerified) throw new AppError("Email already verified");
    if (!user.otp || !user.otpExpiry) throw new AppError("No OTP found. Request a new one.");
    if (isOtpExpired(user.otpExpiry)) throw new AppError("OTP has expired. Request a new one.", HttpStatus.GONE);
    if (user.otp !== dto.otp) throw new AppError("Invalid OTP", HttpStatus.BAD_REQUEST);

    await this._userRepo.verifyUser(dto.email);
  }
}