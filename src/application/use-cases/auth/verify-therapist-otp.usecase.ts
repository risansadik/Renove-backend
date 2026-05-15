import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.js";
import type { VerifyTherapistOtpDTO } from "../../dto/auth/therapist.dto.js";
import { AppError, NotFoundError } from "../../../shared/utils/AppError.js";
import { isOtpExpired } from "../../../shared/utils/otp.js";
import { HttpStatus } from "../../../shared/constants/index.js";
import type { IVerifyOtpUseCase } from "../../interfaces/auth/IAuthUseCase.js";

export class VerifyTherapistOtpUseCase implements IVerifyOtpUseCase {
  constructor(private readonly _therapistRepo: ITherapistRepository) {}

  async execute(dto: VerifyTherapistOtpDTO): Promise<void> {
    const therapist = await this._therapistRepo.findByEmail(dto.email);
    if (!therapist) throw new NotFoundError("Therapist");
    if (therapist.isVerified) throw new AppError("Email already verified");
    if (!therapist.otp || !therapist.otpExpiry) throw new AppError("No OTP found. Request a new one.");
    if (isOtpExpired(therapist.otpExpiry)) throw new AppError("OTP has expired. Request a new one.", HttpStatus.GONE);
    if (therapist.otp !== dto.otp) throw new AppError("Invalid OTP");

    await this._therapistRepo.verifyTherapist(dto.email);
  }
}