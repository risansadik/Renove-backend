import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.ts";
import { AppError } from "../../../shared/utils/AppError.ts";
import { HttpStatus, THERAPIST_STATUS } from "../../../shared/constants/index.ts";
import { TherapistMapper } from "../../mappers/therapist.mapper.ts";

export interface UpdateTherapistProfileDto {
  name?: string;
  profileImage?: string;
  qualification?: string;
  specialization?: string[];
  experience?: number;
  consultationFee?: number;
  bio?: string;
  certifications?: string[];
  certificationFiles?: string[];
}

export class UpdateTherapistProfileUseCase {
  constructor(private readonly _therapistRepo: ITherapistRepository) {}

  async execute(therapistId: string, data: UpdateTherapistProfileDto) {
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
