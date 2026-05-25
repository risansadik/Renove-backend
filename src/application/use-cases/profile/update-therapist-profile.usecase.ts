import { TherapistModel } from "../../../infrastructure/databases/schema/therapist.schema.ts";
import { AppError } from "../../../shared/utils/AppError.ts";
import { HttpStatus, THERAPIST_STATUS } from "../../../shared/constants/index.ts";

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
  async execute(therapistId: string, data: UpdateTherapistProfileDto) {
    const therapist = await TherapistModel.findById(therapistId);
    if (!therapist) {
      throw new AppError("Therapist not found", HttpStatus.NOT_FOUND);
    }

    // Identify if updates are purely personal or include professional data
    const { name, profileImage, ...professionalData } = data;

    // Apply personal updates immediately
    if (name) therapist.name = name;
    if (profileImage) therapist.profileImage = profileImage;

    // If professional data is included, stage it in pendingUpdates and require review
    const hasProfessionalUpdates = Object.keys(professionalData).length > 0;
    
    if (hasProfessionalUpdates) {
      const currentPending = therapist.pendingUpdates || {};
      therapist.pendingUpdates = { ...currentPending, ...professionalData };
      therapist.status = THERAPIST_STATUS.REVIEW_REQUIRED;
      therapist.adminRejectionReason = undefined; // clear previous rejection reason
    }

    await therapist.save();
    
    // Return sanitized updated document
    const updated = await TherapistModel.findById(therapistId).select("-password").lean();
    return updated;
  }
}
