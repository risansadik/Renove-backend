import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.ts";
import { AppError } from "../../../shared/utils/AppError.ts";
import { HttpStatus } from "../../../shared/constants/index.ts";
import { TherapistMapper, PublicTherapistDTO } from "../../mappers/therapist.mapper.ts";
import type { IGetTherapistProfileUseCase } from "../../interfaces/profile/IProfileUseCase.ts";

@injectable()
export class GetTherapistProfileUseCase implements IGetTherapistProfileUseCase {
  constructor(
    @inject(TYPES.TherapistRepository) private readonly _therapistRepo: ITherapistRepository
  ) {}

  async execute(therapistId: string): Promise<PublicTherapistDTO> {
    const therapist = await this._therapistRepo.findById(therapistId);
    if (!therapist) {
      throw new AppError("Therapist not found", HttpStatus.NOT_FOUND);
    }

    return TherapistMapper.toProfileDTO(therapist);
  }
}