import bcrypt from "bcryptjs";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.js";
import type { LoginTherapistDTO } from "../../dto/auth/therapist.dto.js";
import { generateTokens } from "../../../shared/utils/jwt.js";
import { AppError, NotFoundError, UnauthorizedError } from "../../../shared/utils/AppError.js";
import { TherapistMapper } from "../../mappers/therapist.mapper.js";
import { HttpStatus, ROLES, THERAPIST_STATUS } from "../../../shared/constants/index.js";

export class LoginTherapistUseCase {
  constructor(private readonly therapistRepo: ITherapistRepository) {}

  async execute(dto: LoginTherapistDTO) {
    const therapist = await this.therapistRepo.findByEmail(dto.email);
    if (!therapist) throw new NotFoundError("Therapist");
    if (!therapist.isVerified) throw new AppError("Please verify your email first", HttpStatus.FORBIDDEN);
    if (therapist.status === THERAPIST_STATUS.PENDING) throw new AppError("Your account is pending admin approval", HttpStatus.FORBIDDEN);
    if (therapist.status === THERAPIST_STATUS.REJECTED) throw new AppError("Your account application was rejected", HttpStatus.FORBIDDEN);

    const isMatch = await bcrypt.compare(dto.password, therapist.password);
    if (!isMatch) throw new UnauthorizedError("Invalid credentials");

    const tokens = generateTokens({ id: therapist.id, email: therapist.email, role: ROLES.THERAPIST });
    return { tokens, therapist: TherapistMapper.toPublicDTO(therapist) };
  }
}