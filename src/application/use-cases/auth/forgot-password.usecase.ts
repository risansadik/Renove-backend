import type { ForgotPasswordDTO } from "../../dto/auth/user.dto.js";
import { sendPasswordResetOtp } from "../../../infrastructure/external-services/email.service.js";
import { generateOtp, getOtpExpiry } from "../../../shared/utils/otp.js";
import { AppError, NotFoundError } from "../../../shared/utils/AppError.js";

export class ForgotPasswordUseCase {
  constructor(private readonly repo: {
    findByEmail: (email: string) => Promise<any>;
    updateOtp: (email: string, otp: string, otpExpiry: Date) => Promise<void>;
  }) {}

  async execute(dto: ForgotPasswordDTO, type: "user" | "therapist" = "user"): Promise<void> {
    const account = await this.repo.findByEmail(dto.email);
    if (!account) throw new NotFoundError(type === "user" ? "User" : "Therapist");
    
    // Google auth check only for users
    if (type === "user" && account.isGoogleAuth) {
      throw new AppError("Google accounts cannot reset password");
    }

    const otp = generateOtp();
    const otpExpiry = getOtpExpiry();
    await this.repo.updateOtp(dto.email, otp, otpExpiry);
    await sendPasswordResetOtp(dto.email, otp);
  }
}
