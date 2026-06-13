import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.ts";
import type { LoginTherapistDTO } from "../../dto/auth/therapist.dto.ts";
import { AppError, NotFoundError, UnauthorizedError } from "../../../shared/utils/AppError.ts";
import { HttpStatus, ROLES, THERAPIST_STATUS } from "../../../shared/constants/index.ts";
import type { ILoginTherapistUseCase, ILoginResponse } from "../../interfaces/auth/IAuthUseCase.ts";
import type { IPasswordHasher } from "../../interfaces/services/IPasswordHasher.ts";
import type { ITokenService } from "../../interfaces/services/ITokenService.ts";
import { TherapistMapper } from "../../mappers/therapist.mapper.ts";

@injectable()
export class LoginTherapistUseCase implements ILoginTherapistUseCase {
  constructor(
    @inject(TYPES.TherapistRepository) private readonly _therapistRepo: ITherapistRepository,
    @inject(TYPES.PasswordHasher) private readonly _passwordHasher: IPasswordHasher,
    @inject(TYPES.TokenService) private readonly _tokenService: ITokenService
  ) {}

  async execute(dto: LoginTherapistDTO): Promise<ILoginResponse> {
    const therapist = await this._therapistRepo.findByEmail(dto.email);
    if (!therapist) throw new NotFoundError("Therapist");
    if (!therapist.isVerified) throw new AppError("Please verify your email first", HttpStatus.FORBIDDEN);
    if (therapist.status === THERAPIST_STATUS.PENDING) throw new AppError("Your account is pending admin approval", HttpStatus.FORBIDDEN);
    if (therapist.status === THERAPIST_STATUS.REJECTED) throw new AppError("Your account application was rejected", HttpStatus.FORBIDDEN);

    const isMatch = await this._passwordHasher.compare(dto.password, therapist.password);
    if (!isMatch) throw new UnauthorizedError("Invalid credentials");

    const tokens = this._tokenService.generateTokens({ id: therapist.id, email: therapist.email, role: ROLES.THERAPIST });
    return { tokens, user: TherapistMapper.toPublicDTO(therapist) };
  }
}
