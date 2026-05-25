import bcrypt from "bcryptjs";
import type { IUserRepository } from "../../../domain/repositories/user.repository.ts";
import type { RegisterUserDTO } from "../../dto/auth/user.dto.ts";
import { sendOtpEmail } from "../../../infrastructure/external-services/email.service.ts";
import { generateOtp, getOtpExpiry } from "../../../shared/utils/otp.ts";
import { ConflictError } from "../../../shared/utils/AppError.ts";
import { BCRYPT_ROUNDS, USER_STATUS } from "../../../shared/constants/index.ts";

import type { IRegisterUserUseCase, IRegisterResponse } from "../../interfaces/auth/IAuthUseCase.ts";

export class RegisterUserUseCase implements IRegisterUserUseCase {
  constructor(private readonly _userRepo: IUserRepository) {}

  async execute(dto: RegisterUserDTO): Promise<IRegisterResponse> {
    const existing = await this._userRepo.findByEmail(dto.email);
    if (existing && existing.isVerified) throw new ConflictError("Email already registered");

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const otp = generateOtp();
    const otpExpiry = getOtpExpiry();

    if (existing) {
      // Update existing unverified user
      await this._userRepo.update(existing.id, {
        name: dto.name,
        password: hashedPassword,
        otp,
        otpExpiry,
      });
    } else {
      // Create new user
      await this._userRepo.create({
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        isGoogleAuth: false,
        isVerified: false,
        status: USER_STATUS.ACTIVE,
        otp,
        otpExpiry,
      });
    }

    await sendOtpEmail(dto.email, otp, dto.name);
    return { message: "Registration successful. Please verify your email.", email: dto.email };
  }
}
