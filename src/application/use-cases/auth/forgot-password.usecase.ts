import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import type { ForgotPasswordDTO } from "../../dto/auth/user.dto.ts";
import type { IUserRepository } from "../../../domain/repositories/user.repository.ts";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.ts";
import type { IOtpCacheRepository } from "../../../domain/repositories/otp-cache.repository.ts";
import type { IEmailService } from "../../interfaces/services/IEmailService.ts";
import { otpService } from "../../../shared/utils/otp.ts";
import { AppError, NotFoundError } from "../../../shared/utils/AppError.ts";
import { OTP_TTL_SECONDS } from "../../../shared/constants/index.ts";
import type { IForgotPasswordUseCase } from "../../interfaces/auth/IAuthUseCase.ts";

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
