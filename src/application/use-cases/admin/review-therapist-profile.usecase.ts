import { TherapistModel } from "../../../infrastructure/databases/schema/therapist.schema.js";
import { AppError } from "../../../shared/utils/AppError.js";
import { HttpStatus, THERAPIST_STATUS } from "../../../shared/constants/index.js";

export class ReviewTherapistProfileUseCase {
  async execute(therapistId: string, status: typeof THERAPIST_STATUS.APPROVED | typeof THERAPIST_STATUS.REJECTED, reason?: string) {
    const therapist = await TherapistModel.findById(therapistId);
    
    if (!therapist) {
      throw new AppError("Therapist not found", HttpStatus.NOT_FOUND);
    }

    if (therapist.status !== THERAPIST_STATUS.REVIEW_REQUIRED) {
      throw new AppError("Therapist profile is not pending review", HttpStatus.BAD_REQUEST);
    }

    if (status === THERAPIST_STATUS.APPROVED) {
      // Apply pending updates to the live profile
      const updates = therapist.pendingUpdates as Record<string, unknown>;
      if (updates) {
        Object.keys(updates).forEach((key) => {
          therapist.set(key, updates[key]);
        });
      }
      therapist.pendingUpdates = undefined;
      therapist.adminRejectionReason = undefined;
      therapist.status = THERAPIST_STATUS.APPROVED;
    } else if (status === THERAPIST_STATUS.REJECTED) {
      // Discard pending updates and store rejection reason
      therapist.pendingUpdates = undefined;
      therapist.adminRejectionReason = reason;
      therapist.status = THERAPIST_STATUS.APPROVED; // Revert to previously approved state
    }

    await therapist.save();
    return TherapistModel.findById(therapistId).select("-password").lean();
  }
}
