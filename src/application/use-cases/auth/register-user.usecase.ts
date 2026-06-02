import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import { ConflictError } from "../../../shared/utils/AppError.ts";
import { USER_STATUS, OTP_TTL_SECONDS, MESSAGES } from "../../../shared/constants/index.ts";

// Interfaces
import type { IUserRepository } from "../../../domain/repositories/user.repository.ts";
import type { IOtpCacheRepository } from "../../../domain/repositories/otp-cache.repository.ts";
import type { IEmailService } from "../../interfaces/services/IEmailService.ts";
import type { IOtpGenerator } from "../../interfaces/services/IOtpGenerator.ts";
import type { IPasswordHasher } from "../../interfaces/services/IPasswordHasher.ts";
import type { IRegisterUserUseCase, IRegisterResponse } from "../../interfaces/auth/IAuthUseCase.ts";
import type { RegisterUserDTO } from "../../dto/auth/user.dto.ts";

@injectable()
export class RegisterUserUseCase implements IRegisterUserUseCase {
  constructor(
    @inject(TYPES.UserRepository) private readonly _userRepo: IUserRepository,
    @inject(TYPES.OtpCacheRepository) private readonly _otpCacheRepo: IOtpCacheRepository,
    @inject(TYPES.EmailService) private readonly _emailService: IEmailService,
    @inject(TYPES.PasswordHasher) private readonly _passwordHasher: IPasswordHasher,
    @inject(TYPES.OtpGenerator) private readonly _otpGenerator: IOtpGenerator
  ) {}

  async execute(dto: RegisterUserDTO): Promise<IRegisterResponse> {
    const existing = await this._userRepo.findByEmail(dto.email);
    if (existing && existing.isVerified) throw new ConflictError("Email already registered");

    const hashedPassword = await this._passwordHasher.hash(dto.password);
    const otp = this._otpGenerator.generate();

    if (existing) {
      await this._userRepo.update(existing.id, {
        name: dto.name,
        password: hashedPassword,
      });
    } else {

      await this._userRepo.create({
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        isGoogleAuth: false,
        isVerified: false,
        status: USER_STATUS.ACTIVE,
      });
    }

    await this._otpCacheRepo.setOtp(dto.email, otp, OTP_TTL_SECONDS);

    await this._emailService.sendOtpEmail(dto.email, otp, dto.name);

    return { 
      message: MESSAGES.AUTH.REGISTER_SUCCESS, 
      email: dto.email 
    };
  }
}
