import { AdminModel } from "../../../infrastructure/databases/schema/admin.schema.ts";
import { AppError } from "../../../shared/utils/AppError.ts";
import { HttpStatus } from "../../../shared/constants/index.ts";

export class GetAdminProfileUseCase {
  async execute(adminId: string) {
    const admin = await AdminModel.findById(adminId).select("-password").lean();
    if (!admin) {
      throw new AppError("Admin not found", HttpStatus.NOT_FOUND);
    }
    return admin;
  }
}
