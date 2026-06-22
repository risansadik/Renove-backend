import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens";
import { AppError, NotFoundError } from "../../../shared/utils/AppError";
import { otpService } from "../../../shared/utils/otp";
import { OTP_TTL_SECONDS } from "../../../shared/constants/index";

// Interfaces
import type { IUserRepository } from "../../../domain/repositories/user.repository";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository";
import type { IOtpCacheRepository } from "../../../domain/repositories/otp-cache.repository";
import type { IEmailService } from "../../interfaces/services/IEmailService";
import type { IResendOtpUseCase } from "../../interfaces/auth/IAuthUseCase";
import type { ResendOtpDTO } from "../../dto/auth/user.dto";

@injectable()
export class ResendOtpUseCase implements IResendOtpUseCase {
  constructor(
    @inject(TYPES.UserRepository) private readonly _userRepo: IUserRepository,
    @inject(TYPES.TherapistRepository) private readonly _therapistRepo: ITherapistRepository,
    @inject(TYPES.OtpCacheRepository) private readonly _otpCacheRepo: IOtpCacheRepository,
    @inject(TYPES.EmailService) private readonly _emailService: IEmailService
  ) {}

  async execute({ dto, type = "user" }: { dto: ResendOtpDTO; type?: "user" | "therapist" }): Promise<void> {
    const otp = otpService.generate();
    let emailTargetName = "";

    if (type === "user") {
      const user = await this._userRepo.findByEmail(dto.email);
      if (!user) throw new NotFoundError("User");
      if (user.isVerified) throw new AppError("Email already verified");
      
      emailTargetName = user.name;
    } else {
      const therapist = await this._therapistRepo.findByEmail(dto.email);
      if (!therapist) throw new NotFoundError("Therapist");
      if (therapist.isVerified) throw new AppError("Email already verified");
      
      emailTargetName = therapist.name;
      
    }

    await this._otpCacheRepo.setOtp(dto.email, otp, OTP_TTL_SECONDS);

    await this._emailService.sendOtpEmail(dto.email, otp, emailTargetName);
  }
}