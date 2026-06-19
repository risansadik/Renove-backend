import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.ts";
import type { INotificationService } from "../../interfaces/services/INotificationService.ts";
import { AppError } from "../../../shared/utils/AppError.ts";
import { HttpStatus, THERAPIST_STATUS } from "../../../shared/constants/index.ts";
import { PublicTherapistDTO, TherapistMapper } from "../../mappers/therapist.mapper.ts";
import { IReviewTherapistInput, IReviewTherapistProfileUseCase } from "../../interfaces/admin/IAdminUseCase.ts";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";

@injectable()
export class ReviewTherapistProfileUseCase implements IReviewTherapistProfileUseCase {
  constructor(
   @inject(TYPES.TherapistRepository) private readonly _therapistRepo: ITherapistRepository,
   @inject(TYPES.NotificationService) private readonly _notificationService: INotificationService
  ) {}

  async execute({therapistId, status, reason} : IReviewTherapistInput) : Promise<PublicTherapistDTO | null> {
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

      await this._notificationService.createAndEmit({
        recipientId: therapistId,
        recipientRole: "therapist",
        type: "therapist_profile_approved",
        title: "Profile Update Approved",
        message: "Your profile update has been reviewed and approved by the admin.",
      });
    } else {
      await this._therapistRepo.update(therapistId, {
        pendingUpdates: undefined,
        adminRejectionReason: reason,
        status: THERAPIST_STATUS.REJECTED,
      });

      await this._notificationService.createAndEmit({
        recipientId: therapistId,
        recipientRole: "therapist",
        type: "therapist_profile_rejected",
        title: "Profile Update Rejected",
        message: reason
          ? `Your profile update was rejected. Reason: ${reason}`
          : "Your profile update has been rejected. Please review and resubmit.",
      });
    }

    const updated = await this._therapistRepo.findById(therapistId);
    if (!updated) return null;

    return TherapistMapper.toProfileDTO(updated);
  }
}
