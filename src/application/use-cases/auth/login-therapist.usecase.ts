import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository";
import type { LoginTherapistDTO } from "../../dto/auth/therapist.dto";
import { AppError, NotFoundError, UnauthorizedError } from "../../../shared/utils/AppError";
import { HttpStatus, ROLES, THERAPIST_STATUS } from "../../../shared/constants/index";
import type { ILoginTherapistUseCase, ILoginResponse } from "../../interfaces/auth/IAuthUseCase";
import type { IPasswordHasher } from "../../interfaces/services/IPasswordHasher";
import type { ITokenService } from "../../interfaces/services/ITokenService";
import { TherapistMapper } from "../../mappers/therapist.mapper";

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
