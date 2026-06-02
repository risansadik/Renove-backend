import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.ts";
import { AppError } from "../../../shared/utils/AppError.ts";
import { HttpStatus } from "../../../shared/constants/index.ts";
import { TherapistMapper } from "../../mappers/therapist.mapper.ts";

export class GetTherapistProfileUseCase {
  constructor(private readonly _therapistRepo: ITherapistRepository) {}

  async execute(therapistId: string) {
    const therapist = await this._therapistRepo.findById(therapistId);
    if (!therapist) {
      throw new AppError("Therapist not found", HttpStatus.NOT_FOUND);
    }

    return TherapistMapper.toProfileDTO(therapist);
  }
}
