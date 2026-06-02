import type { IUserRepository } from "../../../domain/repositories/user.repository.ts";
import { AppError } from "../../../shared/utils/AppError.ts";
import { HttpStatus } from "../../../shared/constants/index.ts";
import { UserMapper } from "../../mappers/user.mapper.ts";

export class GetUserProfileUseCase {
  constructor(private readonly _userRepo: IUserRepository) {}

  async execute(userId: string) {
    const user = await this._userRepo.findById(userId);
    if (!user) {
      throw new AppError("User not found", HttpStatus.NOT_FOUND);
    }
    return UserMapper.toProfileDTO(user);
  }
}
