import { AdminModel } from "../../../infrastructure/databases/schema/admin.schema.js";
import { AppError } from "../../../shared/utils/AppError.js";
import { HttpStatus } from "../../../shared/constants/index.js";

export class GetAdminProfileUseCase {
  async execute(adminId: string) {
    const admin = await AdminModel.findById(adminId).select("-password").lean();
    if (!admin) {
      throw new AppError("Admin not found", HttpStatus.NOT_FOUND);
    }
    return admin;
  }
}
