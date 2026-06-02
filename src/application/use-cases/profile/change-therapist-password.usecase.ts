import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.ts";
import { AppError } from "../../../shared/utils/AppError.ts";
import { HttpStatus } from "../../../shared/constants/index.ts";
import type { IPasswordHasher } from "../../interfaces/services/IPasswordHasher.ts";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import { IChangePasswordInput, IChangeTherapistPasswordUseCase } from "../../interfaces/profile/IProfileUseCase.ts";

@injectable()
export class ChangeTherapistPasswordUseCase implements IChangeTherapistPasswordUseCase{
  constructor(
    @inject(TYPES.TherapistRepository)private readonly _therapistRepo: ITherapistRepository,
    @inject(TYPES.PasswordHasher)private readonly _passwordHasher: IPasswordHasher
  ) {}

  async execute({id:therapistId, currentPasswordRaw, newPasswordRaw} : IChangePasswordInput) : Promise<boolean> {
    const therapist = await this._therapistRepo.findById(therapistId);
    if (!therapist) {
      throw new AppError("Therapist not found", HttpStatus.NOT_FOUND);
    }

    if (!therapist.password) {
      throw new AppError("Therapist has no password set.", HttpStatus.BAD_REQUEST);
    }

    const isMatch = await this._passwordHasher.compare(currentPasswordRaw, therapist.password);
    if (!isMatch) {
      throw new AppError("Incorrect current password", HttpStatus.UNAUTHORIZED);
    }

    const hashedPassword = await this._passwordHasher.hash(newPasswordRaw);
    await this._therapistRepo.update(therapistId, { password: hashedPassword });

    return true;
  }
}
