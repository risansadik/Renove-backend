import type { VerifyOtpDTO } from "../../dto/auth/user.dto.js";
import { AppError, NotFoundError } from "../../../shared/utils/AppError.js";
import { HttpStatus } from "../../../shared/constants/index.js";
import { isOtpExpired } from "../../../shared/utils/otp.js";

export class VerifyResetOtpUseCase {
  constructor(private readonly repo: {
    findByEmail: (email: string) => Promise<any>;
  }) {}

  async execute(dto: VerifyOtpDTO, type: "user" | "therapist" = "user"): Promise<void> {
    const account = await this.repo.findByEmail(dto.email);
    if (!account) throw new NotFoundError(type === "user" ? "User" : "Therapist");
    
    if (!account.otp || !account.otpExpiry) {
      throw new AppError("No reset request found");
    }

    if (isOtpExpired(account.otpExpiry)) {
      throw new AppError("OTP has expired", HttpStatus.GONE);
    }

    if (account.otp !== dto.otp) {
      throw new AppError("Invalid OTP");
    }
  }
}
