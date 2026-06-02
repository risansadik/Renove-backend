import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.ts";
import type { IOtpCacheRepository } from "../../../domain/repositories/otp-cache.repository.ts";
import type { VerifyTherapistOtpDTO } from "../../dto/auth/therapist.dto.ts";
import { AppError, NotFoundError } from "../../../shared/utils/AppError.ts";
import { HttpStatus } from "../../../shared/constants/index.ts";
import type { IVerifyOtpUseCase } from "../../interfaces/auth/IAuthUseCase.ts";

@injectable()
export class VerifyTherapistOtpUseCase implements IVerifyOtpUseCase {
  constructor(
    @inject(TYPES.TherapistRepository) private readonly _therapistRepo: ITherapistRepository,
    @inject(TYPES.OtpCacheRepository) private readonly _otpCacheRepo: IOtpCacheRepository
  ) {}

  async execute(dto: VerifyTherapistOtpDTO): Promise<void> {
    const therapist = await this._therapistRepo.findByEmail(dto.email);
    if (!therapist) throw new NotFoundError("Therapist");
    if (therapist.isVerified) throw new AppError("Email already verified");

    const cachedOtp = await this._otpCacheRepo.getOtp(dto.email);
    if (!cachedOtp) {
      throw new AppError("OTP has expired or was not requested. Request a new one.", HttpStatus.GONE);
    }
    if (cachedOtp !== dto.otp) {
      throw new AppError("Invalid OTP", HttpStatus.BAD_REQUEST);
    }

    await this._therapistRepo.verifyTherapist(dto.email);
    await this._otpCacheRepo.deleteOtp(dto.email);
  }
}