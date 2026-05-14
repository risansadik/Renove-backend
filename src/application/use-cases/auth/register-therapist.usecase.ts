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
    console.log("REGISTRATION DEBUG:", { email: dto.email, existingFound: !!existing, isVerified: existing?.isVerified });
    if (existing && existing.isVerified) throw new ConflictError("Email already registered");

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const otp = generateOtp();
    const otpExpiry = getOtpExpiry();

    if (existing) {
      // Update existing unverified therapist
      await this.therapistRepo.update(existing.id, {
        ...dto,
        password: hashedPassword,
        otp,
        otpExpiry,
        status: THERAPIST_STATUS.PENDING,
      });
    } else {
      // Create new therapist
      await this.therapistRepo.create({
        ...dto,
        password: hashedPassword,
        isVerified: false,
        status: THERAPIST_STATUS.PENDING,
        otp,
        otpExpiry,
      });
    }

    await sendOtpEmail(dto.email, otp, dto.name);
    return { email: dto.email };
  }
}