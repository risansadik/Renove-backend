import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens";
import { ConflictError } from "../../../shared/utils/AppError";
import { THERAPIST_STATUS, OTP_TTL_SECONDS, MESSAGES } from "../../../shared/constants/index";

// Interfaces
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository";
import type { IOtpCacheRepository } from "../../../domain/repositories/otp-cache.repository";
import type { IEmailService } from "../../interfaces/services/IEmailService";
import type { IOtpGenerator } from "../../interfaces/services/IOtpGenerator";
import type { IPasswordHasher } from "../../interfaces/services/IPasswordHasher";
import type { IRegisterTherapistUseCase, IRegisterResponse } from "../../interfaces/auth/IAuthUseCase";
import type { RegisterTherapistDTO } from "../../dto/auth/therapist.dto";

@injectable()
export class RegisterTherapistUseCase implements IRegisterTherapistUseCase {
  constructor(
    @inject(TYPES.TherapistRepository) private readonly _therapistRepo: ITherapistRepository,
    @inject(TYPES.OtpCacheRepository) private readonly _otpCacheRepo: IOtpCacheRepository,
    @inject(TYPES.EmailService) private readonly _emailService: IEmailService,
    @inject(TYPES.PasswordHasher) private readonly _passwordHasher: IPasswordHasher,
    @inject(TYPES.OtpGenerator) private readonly _otpGenerator: IOtpGenerator
  ) {}

  async execute(dto: RegisterTherapistDTO): Promise<IRegisterResponse> {
    const existing = await this._therapistRepo.findByEmail(dto.email);
    if (existing && existing.isVerified) throw new ConflictError("Email already registered");

    const hashedPassword = await this._passwordHasher.hash(dto.password);
    const otp = this._otpGenerator.generate();

    if (existing) {
      // Update existing unverified therapist
      await this._therapistRepo.update(existing.id, {
        ...dto,
        password: hashedPassword,
        status: THERAPIST_STATUS.PENDING,
      });
    } else {
      // Create new therapist
      await this._therapistRepo.create({
        ...dto,
        password: hashedPassword,
        isVerified: false,
        status: THERAPIST_STATUS.PENDING,
      });
    }

    await this._otpCacheRepo.setOtp(dto.email, otp, OTP_TTL_SECONDS);
    await this._emailService.sendOtpEmail(dto.email, otp, dto.name);

    return { message: MESSAGES.AUTH.REGISTER_SUCCESS, email: dto.email };
  }
}
