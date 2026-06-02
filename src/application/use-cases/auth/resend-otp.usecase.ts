import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import { AppError, NotFoundError } from "../../../shared/utils/AppError.ts";
import { generateOtp } from "../../../shared/utils/otp.ts";
import { OTP_TTL_SECONDS } from "../../../shared/constants/index.ts";

// Interfaces
import type { IUserRepository } from "../../../domain/repositories/user.repository.ts";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.ts";
import type { IOtpCacheRepository } from "../../../domain/repositories/otp-cache.repository.ts";
import type { IEmailService } from "../../interfaces/services/IEmailService.ts";
import type { IResendOtpUseCase } from "../../interfaces/auth/IAuthUseCase.ts";
import type { ResendOtpDTO } from "../../dto/auth/user.dto.ts";

@injectable()
export class ResendOtpUseCase implements IResendOtpUseCase {
  constructor(
    @inject(TYPES.UserRepository) private readonly _userRepo: IUserRepository,
    @inject(TYPES.TherapistRepository) private readonly _therapistRepo: ITherapistRepository,
    @inject(TYPES.OtpCacheRepository) private readonly _otpCacheRepo: IOtpCacheRepository,
    @inject(TYPES.EmailService) private readonly _emailService: IEmailService
  ) {}

  async execute({ dto, type = "user" }: { dto: ResendOtpDTO; type?: "user" | "therapist" }): Promise<void> {
    const otp = generateOtp();
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