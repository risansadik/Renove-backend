import type { IUserRepository } from "../../../domain/repositories/user.repository.ts";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.ts";
import type { ResendOtpDTO } from "../../dto/auth/user.dto.ts";
import { sendOtpEmail } from "../../../infrastructure/external-services/email.service.ts";
import { generateOtp, getOtpExpiry } from "../../../shared/utils/otp.ts";
import { AppError, NotFoundError } from "../../../shared/utils/AppError.ts";



import type { IResendOtpUseCase } from "../../interfaces/auth/IAuthUseCase.ts";

export class ResendOtpUseCase implements IResendOtpUseCase {
  constructor(
    private readonly _userRepo: IUserRepository,
    private readonly _therapistRepo: ITherapistRepository
  ) {}

  async execute({ dto, type = "user" }: { dto: ResendOtpDTO; type?: "user" | "therapist" }): Promise<void> {
    if (type === "user") {
      const user = await this._userRepo.findByEmail(dto.email);
      if (!user) throw new NotFoundError("User");
      if (user.isVerified) throw new AppError("Email already verified");

      const otp = generateOtp();
      const otpExpiry = getOtpExpiry();
      await this._userRepo.updateOtp(dto.email, otp, otpExpiry);
      await sendOtpEmail(dto.email, otp, user.name);
    } else {
      const therapist = await this._therapistRepo.findByEmail(dto.email);
      if (!therapist) throw new NotFoundError("Therapist");
      if (therapist.isVerified) throw new AppError("Email already verified");

      const otp = generateOtp();
      const otpExpiry = getOtpExpiry();
      await this._therapistRepo.updateOtp(dto.email, otp, otpExpiry);
      await sendOtpEmail(dto.email, otp, therapist.name);
    }
  }
}