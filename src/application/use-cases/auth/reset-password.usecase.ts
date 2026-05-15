import bcrypt from "bcryptjs";
import type { ResetPasswordDTO } from "../../dto/auth/user.dto.js";
import { AppError, NotFoundError } from "../../../shared/utils/AppError.js";
import { BCRYPT_ROUNDS, HttpStatus } from "../../../shared/constants/index.js";
import { isOtpExpired } from "../../../shared/utils/otp.js";
import type { UserEntity } from "../../../domain/entities/User.entity.js";
import type { TherapistEntity } from "../../../domain/entities/Therapist.entity.js";

import type { IResetPasswordUseCase } from "../../interfaces/auth/IAuthUseCase.js";

interface IPasswordResetRepository<T> {
  findByEmail: (email: string) => Promise<T | null>;
  update: (id: string, data: Partial<T>) => Promise<T | null>;
}

export class ResetPasswordUseCase<T extends UserEntity | TherapistEntity> implements IResetPasswordUseCase {
  constructor(private readonly _repo: IPasswordResetRepository<T>) {}

  async execute({ dto, type = "user" }: { dto: ResetPasswordDTO; type?: "user" | "therapist" }): Promise<void> {
    const account = await this._repo.findByEmail(dto.email);
    if (!account) throw new NotFoundError(type === "user" ? "User" : "Therapist");
    
    if (!account.otp || !account.otpExpiry) throw new AppError("No reset request found");
    if (isOtpExpired(account.otpExpiry)) throw new AppError("OTP has expired", HttpStatus.GONE);
    if (account.otp !== dto.otp) throw new AppError("Invalid OTP");

    const hashedPassword = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    await this._repo.update(account.id, {
      password: hashedPassword,
      otp: undefined,
      otpExpiry: undefined,
    } as Partial<T>);
  }
}
