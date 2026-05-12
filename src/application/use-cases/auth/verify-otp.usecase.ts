import type { IUserRepository } from "../../../domain/repositories/user.repository.js";
import type { VerifyOtpDTO } from "../../dto/auth/user.dto.js";
import { AppError, NotFoundError } from "../../../shared/utils/AppError.js";
import { isOtpExpired } from "../../../shared/utils/otp.js";
import { HttpStatus } from "../../../shared/constants/index.js";

export class VerifyOtpUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(dto: VerifyOtpDTO): Promise<void> {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) throw new NotFoundError("User");
    if (user.isVerified) throw new AppError("Email already verified");
    if (!user.otp || !user.otpExpiry) throw new AppError("No OTP found. Request a new one.");
    if (isOtpExpired(user.otpExpiry)) throw new AppError("OTP has expired. Request a new one.", HttpStatus.GONE);
    if (user.otp !== dto.otp) throw new AppError("Invalid OTP", HttpStatus.BAD_REQUEST);

    await this.userRepo.verifyUser(dto.email);
  }
}