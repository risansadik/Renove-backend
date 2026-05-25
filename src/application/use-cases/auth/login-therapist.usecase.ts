import bcrypt from "bcryptjs";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.ts";
import type { LoginTherapistDTO } from "../../dto/auth/therapist.dto.ts";
import { generateTokens } from "../../../shared/utils/jwt.ts";
import { AppError, NotFoundError, UnauthorizedError } from "../../../shared/utils/AppError.ts";
import { HttpStatus, ROLES, THERAPIST_STATUS } from "../../../shared/constants/index.ts";

import type { ILoginTherapistUseCase, ILoginResponse } from "../../interfaces/auth/IAuthUseCase.ts";

export class LoginTherapistUseCase implements ILoginTherapistUseCase {
  constructor(private readonly _therapistRepo: ITherapistRepository) {}

  async execute(dto: LoginTherapistDTO): Promise<ILoginResponse> {
    const therapist = await this._therapistRepo.findByEmail(dto.email);
    if (!therapist) throw new NotFoundError("Therapist");
    if (!therapist.isVerified) throw new AppError("Please verify your email first", HttpStatus.FORBIDDEN);
    if (therapist.status === THERAPIST_STATUS.PENDING) throw new AppError("Your account is pending admin approval", HttpStatus.FORBIDDEN);
    if (therapist.status === THERAPIST_STATUS.REJECTED) throw new AppError("Your account application was rejected", HttpStatus.FORBIDDEN);

    const isMatch = await bcrypt.compare(dto.password, therapist.password);
    if (!isMatch) throw new UnauthorizedError("Invalid credentials");

    const tokens = generateTokens({ id: therapist.id, email: therapist.email, role: ROLES.THERAPIST });
    return { tokens, user: therapist };
  }
}