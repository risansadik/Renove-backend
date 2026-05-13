import type { IUserRepository } from "../../../domain/repositories/user.repository.js";
import type { VerifyOtpDTO } from "../../dto/auth/user.dto.js";
import { AppError, NotFoundError } from "../../../shared/utils/AppError.js";
import { HttpStatus } from "../../../shared/constants/index.js";
import { isOtpExpired } from "../../../shared/utils/otp.js";

export class VerifyResetOtpUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(dto: VerifyOtpDTO): Promise<void> {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) throw new NotFoundError("User");
    
    if (!user.otp || !user.otpExpiry) {
      throw new AppError("No reset request found");
    }

    if (isOtpExpired(user.otpExpiry)) {
      throw new AppError("OTP has expired", HttpStatus.GONE);
    }

    if (user.otp !== dto.otp) {
      throw new AppError("Invalid OTP");
    }
    
    // Note: We don't clear the OTP here. 
    // It will be cleared during the actual password reset.
  }
}
