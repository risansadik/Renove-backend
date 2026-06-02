import type { IUserRepository } from "../../../domain/repositories/user.repository.ts";
import { AppError } from "../../../shared/utils/AppError.ts";
import { HttpStatus } from "../../../shared/constants/index.ts";
import { UserMapper } from "../../mappers/user.mapper.ts";

export interface UpdateUserProfileDto {
  name?: string;
  profileImage?: string;
}

export class UpdateUserProfileUseCase {
  constructor(private readonly _userRepo: IUserRepository) {}

  async execute(userId: string, data: UpdateUserProfileDto) {
    const user = await this._userRepo.update(userId, data);

    if (!user) {
      throw new AppError("User not found", HttpStatus.NOT_FOUND);
    }

    return UserMapper.toProfileDTO(user);
  }
}
