import { UserModel } from "../../../infrastructure/databases/schema/user.schema.ts";
import { AppError } from "../../../shared/utils/AppError.ts";
import { HttpStatus, BCRYPT_ROUNDS } from "../../../shared/constants/index.ts";
import bcrypt from "bcryptjs";

export class ChangeUserPasswordUseCase {
  async execute(userId: string, currentPasswordRaw: string, newPasswordRaw: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError("User not found", HttpStatus.NOT_FOUND);
    }

    if (user.isGoogleAuth) {
      throw new AppError("Users authenticated via Google cannot change their password here.", HttpStatus.BAD_REQUEST);
    }

    if (!user.password) {
      throw new AppError("User has no password set.", HttpStatus.BAD_REQUEST);
    }

    const isMatch = await bcrypt.compare(currentPasswordRaw, user.password);
    if (!isMatch) {
      throw new AppError("Incorrect current password", HttpStatus.UNAUTHORIZED);
    }

    const hashedPassword = await bcrypt.hash(newPasswordRaw, BCRYPT_ROUNDS);
    user.password = hashedPassword;
    await user.save();

    return true;
  }
}
