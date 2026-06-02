import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.ts";
import { AppError } from "../../../shared/utils/AppError.ts";
import { HttpStatus, THERAPIST_STATUS } from "../../../shared/constants/index.ts";
import { TherapistMapper, PublicTherapistDTO } from "../../mappers/therapist.mapper.ts";
import type { IUpdateTherapistProfileUseCase, IUpdateTherapistProfileInput } from "../../interfaces/profile/IProfileUseCase.ts";


@injectable()
export class UpdateTherapistProfileUseCase implements IUpdateTherapistProfileUseCase {
  constructor(
    @inject(TYPES.TherapistRepository) private readonly _therapistRepo: ITherapistRepository
  ) {}

  async execute({ therapistId, data }: IUpdateTherapistProfileInput): Promise<PublicTherapistDTO | null> {
    const therapist = await this._therapistRepo.findById(therapistId);
    if (!therapist) {
      throw new AppError("Therapist not found", HttpStatus.NOT_FOUND);
    }

    const { name, profileImage, ...professionalData } = data;
    const hasProfessionalUpdates = Object.keys(professionalData).length > 0;
    const updateData: Parameters<ITherapistRepository["update"]>[1] = {};

    if (name) updateData.name = name;
    if (profileImage) updateData.profileImage = profileImage;

    if (hasProfessionalUpdates) {
      updateData.pendingUpdates = { ...(therapist.pendingUpdates ?? {}), ...professionalData };
      updateData.status = THERAPIST_STATUS.REVIEW_REQUIRED;
      updateData.adminRejectionReason = undefined;
    }

    const updated = await this._therapistRepo.update(therapistId, updateData);
    if (!updated) return null;

    return TherapistMapper.toProfileDTO(updated);
  }
}