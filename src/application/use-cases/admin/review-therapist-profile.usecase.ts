import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.ts";
import { AppError } from "../../../shared/utils/AppError.ts";
import { HttpStatus, THERAPIST_STATUS } from "../../../shared/constants/index.ts";
import { TherapistMapper } from "../../mappers/therapist.mapper.ts";

export class ReviewTherapistProfileUseCase {
  constructor(private readonly _therapistRepo: ITherapistRepository) {}

  async execute(therapistId: string, status: typeof THERAPIST_STATUS.APPROVED | typeof THERAPIST_STATUS.REJECTED, reason?: string) {
    const therapist = await this._therapistRepo.findById(therapistId);

    if (!therapist) {
      throw new AppError("Therapist not found", HttpStatus.NOT_FOUND);
    }

    if (therapist.status !== THERAPIST_STATUS.REVIEW_REQUIRED) {
      throw new AppError("Therapist profile is not pending review", HttpStatus.BAD_REQUEST);
    }

    if (status === THERAPIST_STATUS.APPROVED) {
      await this._therapistRepo.update(therapistId, {
        ...(therapist.pendingUpdates ?? {}),
        pendingUpdates: undefined,
        adminRejectionReason: undefined,
        status: THERAPIST_STATUS.APPROVED,
      });
    } else {
      await this._therapistRepo.update(therapistId, {
        pendingUpdates: undefined,
        adminRejectionReason: reason,
        status: THERAPIST_STATUS.APPROVED,
      });
    }

    const updated = await this._therapistRepo.findById(therapistId);
    if (!updated) return null;

    return TherapistMapper.toProfileDTO(updated);
  }
}
