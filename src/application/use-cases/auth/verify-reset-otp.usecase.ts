import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import type { VerifyOtpDTO } from "../../dto/auth/user.dto.ts";
import { AppError, NotFoundError } from "../../../shared/utils/AppError.ts";
import { HttpStatus } from "../../../shared/constants/index.ts";

// Interfaces
import type { IUserRepository } from "../../../domain/repositories/user.repository.ts";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.ts";
import type { IOtpCacheRepository } from "../../../domain/repositories/otp-cache.repository.ts";
import type { IVerifyResetOtpUseCase } from "../../interfaces/auth/IAuthUseCase.ts";

@injectable()
export class VerifyResetOtpUseCase implements IVerifyResetOtpUseCase {
  constructor(
    @inject(TYPES.UserRepository) private readonly _userRepo: IUserRepository,
    @inject(TYPES.TherapistRepository) private readonly _therapistRepo: ITherapistRepository,
    @inject(TYPES.OtpCacheRepository) private readonly _otpCacheRepo: IOtpCacheRepository
  ) {}

  async execute({ dto, type = "user" }: { dto: VerifyOtpDTO; type?: "user" | "therapist" }): Promise<void> {
    if (type === "user") {
      const user = await this._userRepo.findByEmail(dto.email);
      if (!user) throw new NotFoundError("User");
    } else {
      const therapist = await this._therapistRepo.findByEmail(dto.email);
      if (!therapist) throw new NotFoundError("Therapist");
    }

    const cachedOtp = await this._otpCacheRepo.getOtp(dto.email);
    if (!cachedOtp) {
      throw new AppError("OTP has expired or was not requested. Request a new one.", HttpStatus.GONE);
    }
    if (cachedOtp !== dto.otp) {
      throw new AppError("Invalid OTP", HttpStatus.BAD_REQUEST);
    }
  }
}
