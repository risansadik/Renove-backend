import bcrypt from "bcryptjs";
import type { IUserRepository } from "../../../domain/repositories/user.repository.js";
import type { RegisterUserDTO } from "../../dto/auth/user.dto.js";
import { sendOtpEmail } from "../../../infrastructure/external-services/email.service.js";
import { generateOtp, getOtpExpiry } from "../../../shared/utils/otp.js";
import { ConflictError } from "../../../shared/utils/AppError.js";
import { BCRYPT_ROUNDS } from "../../../shared/constants/index.js";

export class RegisterUserUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(dto: RegisterUserDTO): Promise<{ email: string }> {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) throw new ConflictError("Email already registered");

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const otp = generateOtp();
    const otpExpiry = getOtpExpiry();

    await this.userRepo.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      isGoogleAuth: false,
      isVerified: false,
      status: "active",
      otp,
      otpExpiry,
    });

    await sendOtpEmail(dto.email, otp, dto.name);
    return { email: dto.email };
  }
}