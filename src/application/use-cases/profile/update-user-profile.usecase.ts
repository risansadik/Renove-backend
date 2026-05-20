import { UserModel } from "../../../infrastructure/databases/schema/user.schema.js";
import { AppError } from "../../../shared/utils/AppError.js";
import { HttpStatus } from "../../../shared/constants/index.js";

export interface UpdateUserProfileDto {
  name?: string;
  profileImage?: string;
}

export class UpdateUserProfileUseCase {
  async execute(userId: string, data: UpdateUserProfileDto) {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true }
    ).select("-password").lean();

    if (!user) {
      throw new AppError("User not found", HttpStatus.NOT_FOUND);
    }

    return user;
  }
}
