import { UserModel } from "../../../infrastructure/databases/schema/user.schema.ts";
import { AppError } from "../../../shared/utils/AppError.ts";
import { HttpStatus } from "../../../shared/constants/index.ts";

export class GetUserProfileUseCase {
  async execute(userId: string) {
    const user = await UserModel.findById(userId).select("-password").lean();
    if (!user) {
      throw new AppError("User not found", HttpStatus.NOT_FOUND);
    }
    return user;
  }
}
