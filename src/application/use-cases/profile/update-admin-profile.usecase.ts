import { AdminModel } from "../../../infrastructure/databases/schema/admin.schema.js";
import { AppError } from "../../../shared/utils/AppError.js";
import { HttpStatus } from "../../../shared/constants/index.js";

export interface UpdateAdminProfileDto {
  name?: string;
  profileImage?: string;
}

export class UpdateAdminProfileUseCase {
  async execute(adminId: string, data: UpdateAdminProfileDto) {
    const admin = await AdminModel.findByIdAndUpdate(
      adminId,
      { $set: data },
      { new: true, runValidators: true }
    ).select("-password").lean();

    if (!admin) {
      throw new AppError("Admin not found", HttpStatus.NOT_FOUND);
    }

    return admin;
  }
}
