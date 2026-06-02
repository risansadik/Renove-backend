import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import type { IUserRepository } from "../../../domain/repositories/user.repository.ts";
import { AppError } from "../../../shared/utils/AppError.ts";
import { HttpStatus } from "../../../shared/constants/index.ts";
import { UserMapper, PublicUserDTO } from "../../mappers/user.mapper.ts";
import type { IGetUserProfileUseCase } from "../../interfaces/profile/IProfileUseCase.ts";

@injectable()
export class GetUserProfileUseCase implements IGetUserProfileUseCase {
  constructor(
    @inject(TYPES.UserRepository) private readonly _userRepo: IUserRepository
  ) {}

  async execute(userId: string): Promise<PublicUserDTO> {
    const user = await this._userRepo.findById(userId);
    if (!user) {
      throw new AppError("User not found", HttpStatus.NOT_FOUND);
    }
    return UserMapper.toProfileDTO(user);
  }
}