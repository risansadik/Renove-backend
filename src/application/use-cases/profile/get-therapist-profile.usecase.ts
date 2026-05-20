import { TherapistModel } from "../../../infrastructure/databases/schema/therapist.schema.js";
import { AppError } from "../../../shared/utils/AppError.js";
import { HttpStatus } from "../../../shared/constants/index.js";

export class GetTherapistProfileUseCase {
  async execute(therapistId: string) {
    const therapist = await TherapistModel.findById(therapistId).select("-password").lean();
    if (!therapist) {
      throw new AppError("Therapist not found", HttpStatus.NOT_FOUND);
    }
    return therapist;
  }
}
