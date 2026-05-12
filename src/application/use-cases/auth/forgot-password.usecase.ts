import type { IUserRepository } from "../../../domain/repositories/user.repository.js";
import type { ForgotPasswordDTO } from "../../dto/auth/user.dto.js";
import { sendPasswordResetOtp } from "../../../infrastructure/external-services/email.service.js";
import { generateOtp, getOtpExpiry } from "../../../shared/utils/otp.js";
import { AppError, NotFoundError } from "../../../shared/utils/AppError.js";

export class ForgotPasswordUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(dto: ForgotPasswordDTO): Promise<void> {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) throw new NotFoundError("User");
    if (user.isGoogleAuth) throw new AppError("Google accounts cannot reset password");

    const otp = generateOtp();
    const otpExpiry = getOtpExpiry();
    await this.userRepo.updateOtp(dto.email, otp, otpExpiry);
    await sendPasswordResetOtp(dto.email, otp);
  }
}
