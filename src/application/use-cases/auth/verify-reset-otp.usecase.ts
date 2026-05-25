import type { VerifyOtpDTO } from "../../dto/auth/user.dto.ts";
import { AppError, NotFoundError } from "../../../shared/utils/AppError.ts";
import { HttpStatus } from "../../../shared/constants/index.ts";
import { isOtpExpired } from "../../../shared/utils/otp.ts";
import type { UserEntity } from "../../../domain/entities/User.entity.ts";
import type { TherapistEntity } from "../../../domain/entities/Therapist.entity.ts";

import type { IVerifyResetOtpUseCase } from "../../interfaces/auth/IAuthUseCase.ts";

export class VerifyResetOtpUseCase<T extends UserEntity | TherapistEntity> implements IVerifyResetOtpUseCase {
  constructor(private readonly _repo: {
    findByEmail: (email: string) => Promise<T | null>;
  }) {}

  async execute({ dto, type = "user" }: { dto: VerifyOtpDTO; type?: "user" | "therapist" }): Promise<void> {
    const account = await this._repo.findByEmail(dto.email);
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
