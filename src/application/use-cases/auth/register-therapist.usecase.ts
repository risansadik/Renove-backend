import bcrypt from "bcryptjs";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.js";
import type { RegisterTherapistDTO } from "../../dto/auth/therapist.dto.js";
import { sendOtpEmail } from "../../../infrastructure/external-services/email.service.js";
import { generateOtp, getOtpExpiry } from "../../../shared/utils/otp.js";
import { ConflictError } from "../../../shared/utils/AppError.js";
import { BCRYPT_ROUNDS, THERAPIST_STATUS } from "../../../shared/constants/index.js";

export class RegisterTherapistUseCase {
  constructor(private readonly therapistRepo: ITherapistRepository) {}

  async execute(dto: RegisterTherapistDTO): Promise<{ email: string }> {
    const existing = await this.therapistRepo.findByEmail(dto.email);
    if (existing) throw new ConflictError("Email already registered");

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const otp = generateOtp();
    const otpExpiry = getOtpExpiry();

    await this.therapistRepo.create({
      ...dto,
      password: hashedPassword,
      isVerified: false,
      status: THERAPIST_STATUS.PENDING,
      otp,
      otpExpiry,
    });

    await sendOtpEmail(dto.email, otp, dto.name);
    return { email: dto.email };
  }
}