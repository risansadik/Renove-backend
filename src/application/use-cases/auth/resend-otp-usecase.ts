import type { IUserRepository } from "../../../domain/repositories/user.repository.js";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.js";
import type { ResendOtpDTO } from "../../dto/auth/user.dto.js";
import { sendOtpEmail } from "../../../infrastructure/external-services/email.service.js";
import { generateOtp, getOtpExpiry } from "../../../shared/utils/otp.js";
import { AppError, NotFoundError } from "../../../shared/utils/AppError.js";
import { ROLES } from "../../../shared/constants/index.js";

type OtpRole = typeof ROLES.USER | typeof ROLES.THERAPIST

export class ResendOtpUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly therapistRepo: ITherapistRepository
  ) {}

  async execute(dto: ResendOtpDTO, role: OtpRole): Promise<void> {
    if (role === ROLES.USER) {
      const user = await this.userRepo.findByEmail(dto.email);
      if (!user) throw new NotFoundError("User");
      if (user.isVerified) throw new AppError("Email already verified");

      const otp = generateOtp();
      const otpExpiry = getOtpExpiry();
      await this.userRepo.updateOtp(dto.email, otp, otpExpiry);
      await sendOtpEmail(dto.email, otp, user.name);
    } else {
      const therapist = await this.therapistRepo.findByEmail(dto.email);
      if (!therapist) throw new NotFoundError("Therapist");
      if (therapist.isVerified) throw new AppError("Email already verified");

      const otp = generateOtp();
      const otpExpiry = getOtpExpiry();
      await this.therapistRepo.updateOtp(dto.email, otp, otpExpiry);
      await sendOtpEmail(dto.email, otp, therapist.name);
    }
  }
}