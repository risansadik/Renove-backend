import { AdminModel } from "../../../infrastructure/databases/schema/admin.schema.js";
import { AppError } from "../../../shared/utils/AppError.js";
import { HttpStatus, BCRYPT_ROUNDS } from "../../../shared/constants/index.js";
import bcrypt from "bcryptjs";

export class ChangeAdminPasswordUseCase {
  async execute(adminId: string, currentPasswordRaw: string, newPasswordRaw: string) {
    const admin = await AdminModel.findById(adminId);
    if (!admin) {
      throw new AppError("Admin not found", HttpStatus.NOT_FOUND);
    }

    if (!admin.password) {
      throw new AppError("Admin has no password set.", HttpStatus.BAD_REQUEST);
    }

    const isMatch = await bcrypt.compare(currentPasswordRaw, admin.password);
    if (!isMatch) {
      throw new AppError("Incorrect current password", HttpStatus.UNAUTHORIZED);
    }

    const hashedPassword = await bcrypt.hash(newPasswordRaw, BCRYPT_ROUNDS);
    admin.password = hashedPassword;
    await admin.save();

    return true;
  }
}
