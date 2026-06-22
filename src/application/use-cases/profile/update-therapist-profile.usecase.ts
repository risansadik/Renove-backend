import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/constants/tokens";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository";
import type { INotificationService } from "../../interfaces/services/INotificationService";
import { AppError } from "../../../shared/utils/AppError";
import { HttpStatus, THERAPIST_STATUS } from "../../../shared/constants/index";
import { TherapistMapper, PublicTherapistDTO } from "../../mappers/therapist.mapper";
import type { IUpdateTherapistProfileUseCase, IUpdateTherapistProfileInput } from "../../interfaces/profile/IProfileUseCase";


@injectable()
export class UpdateTherapistProfileUseCase implements IUpdateTherapistProfileUseCase {
  constructor(
    @inject(TYPES.TherapistRepository) private readonly _therapistRepo: ITherapistRepository,
    @inject(TYPES.NotificationService) private readonly _notificationService: INotificationService
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

    if (hasProfessionalUpdates) {
      await this._notificationService.createAndEmit({
        recipientId: therapistId,
        recipientRole: "therapist",
        type: "profile_update_submitted",
        title: "Profile Update Submitted",
        message: "Your profile changes have been submitted and are pending admin review. You will be notified once reviewed.",
      });
    }

    return TherapistMapper.toProfileDTO(updated);
  }
}