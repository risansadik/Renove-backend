import bcrypt from "bcryptjs";
import type { ResetPasswordDTO } from "../../dto/auth/user.dto.ts";
import { AppError, NotFoundError } from "../../../shared/utils/AppError.ts";
import { BCRYPT_ROUNDS, HttpStatus } from "../../../shared/constants/index.ts";
import { isOtpExpired } from "../../../shared/utils/otp.ts";
import type { UserEntity } from "../../../domain/entities/User.entity.ts";
import type { TherapistEntity } from "../../../domain/entities/Therapist.entity.ts";

import type { IResetPasswordUseCase } from "../../interfaces/auth/IAuthUseCase.ts";

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
