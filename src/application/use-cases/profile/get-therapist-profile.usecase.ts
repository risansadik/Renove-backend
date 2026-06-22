import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/constants/tokens";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository";
import { AppError } from "../../../shared/utils/AppError";
import { HttpStatus } from "../../../shared/constants/index";
import { TherapistMapper, PublicTherapistDTO } from "../../mappers/therapist.mapper";
import type { IGetTherapistProfileUseCase } from "../../interfaces/profile/IProfileUseCase";

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