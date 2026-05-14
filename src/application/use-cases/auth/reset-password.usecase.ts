import bcrypt from "bcryptjs";
import type { ResetPasswordDTO } from "../../dto/auth/user.dto.js";
import { AppError, NotFoundError } from "../../../shared/utils/AppError.js";
import { BCRYPT_ROUNDS, HttpStatus } from "../../../shared/constants/index.js";
import { isOtpExpired } from "../../../shared/utils/otp.js";

export class ResetPasswordUseCase {
  constructor(private readonly repo: {
    findByEmail: (email: string) => Promise<any>;
    update: (id: string, data: any) => Promise<any>;
  }) {}

  async execute(dto: ResetPasswordDTO, type: "user" | "therapist" = "user"): Promise<void> {
    const account = await this.repo.findByEmail(dto.email);
    if (!account) throw new NotFoundError(type === "user" ? "User" : "Therapist");
    
    if (!account.otp || !account.otpExpiry) throw new AppError("No reset request found");
    if (isOtpExpired(account.otpExpiry)) throw new AppError("OTP has expired", HttpStatus.GONE);
    if (account.otp !== dto.otp) throw new AppError("Invalid OTP");

    const hashedPassword = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    await this.repo.update(account.id, {
      password: hashedPassword,
      otp: undefined,
      otpExpiry: undefined,
    });
  }
}
