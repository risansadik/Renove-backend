import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens";
import type { ForgotPasswordDTO } from "../../dto/auth/user.dto";
import type { IUserRepository } from "../../../domain/repositories/user.repository";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository";
import type { IOtpCacheRepository } from "../../../domain/repositories/otp-cache.repository";
import type { IEmailService } from "../../interfaces/services/IEmailService";
import { otpService } from "../../../shared/utils/otp";
import { AppError, NotFoundError } from "../../../shared/utils/AppError";
import { OTP_TTL_SECONDS } from "../../../shared/constants/index";
import type { IForgotPasswordUseCase } from "../../interfaces/auth/IAuthUseCase";

@injectable()
export class ForgotPasswordUseCase implements IForgotPasswordUseCase {
  constructor(
    @inject(TYPES.UserRepository) private readonly _userRepo: IUserRepository,
    @inject(TYPES.TherapistRepository) private readonly _therapistRepo: ITherapistRepository,
    @inject(TYPES.OtpCacheRepository) private readonly _otpCacheRepo: IOtpCacheRepository,
    @inject(TYPES.EmailService) private readonly _emailService: IEmailService
  ) {}

  async execute({ dto, type = "user" }: { dto: ForgotPasswordDTO; type?: "user" | "therapist" }): Promise<void> {
    if (type === "user") {
      const user = await this._userRepo.findByEmail(dto.email);
      if (!user) throw new NotFoundError("User");
      if (user.isGoogleAuth) throw new AppError("Google accounts cannot reset password");
    } else {
      const therapist = await this._therapistRepo.findByEmail(dto.email);
      if (!therapist) throw new NotFoundError("Therapist");
    }

    const otp = otpService.generate();
    await this._otpCacheRepo.setOtp(dto.email, otp, OTP_TTL_SECONDS);
    await this._emailService.sendPasswordResetOtp(dto.email, otp);
  }
}
