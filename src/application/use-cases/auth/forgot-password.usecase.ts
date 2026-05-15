import type { ForgotPasswordDTO } from "../../dto/auth/user.dto.js";
import { sendPasswordResetOtp } from "../../../infrastructure/external-services/email.service.js";
import { generateOtp, getOtpExpiry } from "../../../shared/utils/otp.js";
import { AppError, NotFoundError } from "../../../shared/utils/AppError.js";
import type { UserEntity } from "../../../domain/entities/User.entity.js";
import type { TherapistEntity } from "../../../domain/entities/Therapist.entity.js";

import type { IForgotPasswordUseCase } from "../../interfaces/auth/IAuthUseCase.js";

export class ForgotPasswordUseCase<T extends UserEntity | TherapistEntity> implements IForgotPasswordUseCase {
  constructor(private readonly repo: {
    findByEmail: (email: string) => Promise<T | null>;
    updateOtp: (email: string, otp: string, otpExpiry: Date) => Promise<void>;
  }) {}

  async execute({ dto, type = "user" }: { dto: ForgotPasswordDTO; type?: "user" | "therapist" }): Promise<void> {
    const account = await this.repo.findByEmail(dto.email);
    if (!account) throw new NotFoundError(type === "user" ? "User" : "Therapist");
    
    // Google auth check only for users
    if (type === "user" && (account as UserEntity).isGoogleAuth) {
      throw new AppError("Google accounts cannot reset password");
    }

    const otp = generateOtp();
    const otpExpiry = getOtpExpiry();
    await this.repo.updateOtp(dto.email, otp, otpExpiry);
    await sendPasswordResetOtp(dto.email, otp);
  }
}
