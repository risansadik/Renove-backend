import bcrypt from "bcryptjs";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.ts";
import type { RegisterTherapistDTO } from "../../dto/auth/therapist.dto.ts";
import { sendOtpEmail } from "../../../infrastructure/external-services/email.service.ts";
import { generateOtp, getOtpExpiry } from "../../../shared/utils/otp.ts";
import { ConflictError } from "../../../shared/utils/AppError.ts";
import { BCRYPT_ROUNDS, THERAPIST_STATUS } from "../../../shared/constants/index.ts";

import type { IRegisterTherapistUseCase, IRegisterResponse } from "../../interfaces/auth/IAuthUseCase.ts";

export class RegisterTherapistUseCase implements IRegisterTherapistUseCase {
  constructor(private readonly _therapistRepo: ITherapistRepository) {}

  async execute(dto: RegisterTherapistDTO): Promise<IRegisterResponse> {
    const existing = await this._therapistRepo.findByEmail(dto.email);
    console.log("REGISTRATION DEBUG:", { email: dto.email, existingFound: !!existing, isVerified: existing?.isVerified });
    if (existing && existing.isVerified) throw new ConflictError("Email already registered");

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const otp = generateOtp();
    const otpExpiry = getOtpExpiry();

    if (existing) {
      // Update existing unverified therapist
      await this._therapistRepo.update(existing.id, {
        ...dto,
        password: hashedPassword,
        otp,
        otpExpiry,
        status: THERAPIST_STATUS.PENDING,
      });
    } else {
      // Create new therapist
      await this._therapistRepo.create({
        ...dto,
        password: hashedPassword,
        isVerified: false,
        status: THERAPIST_STATUS.PENDING,
        otp,
        otpExpiry,
      });
    }

    await sendOtpEmail(dto.email, otp, dto.name);
    return { message: "Registration successful. Please verify your email.", email: dto.email };
  }
}