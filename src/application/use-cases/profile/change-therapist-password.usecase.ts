import { TherapistModel } from "../../../infrastructure/databases/schema/therapist.schema.ts";
import { AppError } from "../../../shared/utils/AppError.ts";
import { HttpStatus, BCRYPT_ROUNDS } from "../../../shared/constants/index.ts";
import bcrypt from "bcryptjs";

export class ChangeTherapistPasswordUseCase {
  async execute(therapistId: string, currentPasswordRaw: string, newPasswordRaw: string) {
    const therapist = await TherapistModel.findById(therapistId);
    if (!therapist) {
      throw new AppError("Therapist not found", HttpStatus.NOT_FOUND);
    }

    if (!therapist.password) {
      throw new AppError("Therapist has no password set.", HttpStatus.BAD_REQUEST);
    }

    const isMatch = await bcrypt.compare(currentPasswordRaw, therapist.password);
    if (!isMatch) {
      throw new AppError("Incorrect current password", HttpStatus.UNAUTHORIZED);
    }

    const hashedPassword = await bcrypt.hash(newPasswordRaw, BCRYPT_ROUNDS);
    therapist.password = hashedPassword;
    await therapist.save();

    return true;
  }
}
