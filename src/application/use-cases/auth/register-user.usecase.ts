import bcrypt from "bcryptjs";
import type { IUserRepository } from "../../../domain/repositories/user.repository.js";
import type { RegisterUserDTO } from "../../dto/auth/user.dto.js";
import { sendOtpEmail } from "../../../infrastructure/external-services/email.service.js";
import { generateOtp, getOtpExpiry } from "../../../shared/utils/otp.js";
import { ConflictError } from "../../../shared/utils/AppError.js";
import { BCRYPT_ROUNDS, USER_STATUS } from "../../../shared/constants/index.js";

import type { IRegisterUserUseCase, IRegisterResponse } from "../../interfaces/auth/IAuthUseCase.js";

export class RegisterUserUseCase implements IRegisterUserUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(dto: RegisterUserDTO): Promise<IRegisterResponse> {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing && existing.isVerified) throw new ConflictError("Email already registered");

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const otp = generateOtp();
    const otpExpiry = getOtpExpiry();

    if (existing) {
      // Update existing unverified user
      await this.userRepo.update(existing.id, {
        name: dto.name,
        password: hashedPassword,
        otp,
        otpExpiry,
      });
    } else {
      // Create new user
      await this.userRepo.create({
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
