import { TherapistModel } from "../../../infrastructure/databases/schema/therapist.schema.ts";
import { AppError } from "../../../shared/utils/AppError.ts";
import { HttpStatus } from "../../../shared/constants/index.ts";

export class GetTherapistProfileUseCase {
  async execute(therapistId: string) {
    const therapist = await TherapistModel.findById(therapistId).select("-password").lean();
    if (!therapist) {
      throw new AppError("Therapist not found", HttpStatus.NOT_FOUND);
    }
    return therapist;
  }
}
