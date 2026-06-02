import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import type { IUserRepository } from "../../../domain/repositories/user.repository.ts";
import { AppError } from "../../../shared/utils/AppError.ts";
import { HttpStatus } from "../../../shared/constants/index.ts";
import { UserMapper, PublicUserDTO } from "../../mappers/user.mapper.ts";
import type { IUpdateUserProfileUseCase, IUpdateUserProfileInput } from "../../interfaces/profile/IProfileUseCase.ts";

@injectable()
export class UpdateUserProfileUseCase implements IUpdateUserProfileUseCase {
  constructor(
    @inject(TYPES.UserRepository) private readonly _userRepo: IUserRepository
  ) {}

  // Fixed: Parameters packed into unified input payload object
  async execute({ userId, data }: IUpdateUserProfileInput): Promise<PublicUserDTO> {
    const user = await this._userRepo.update(userId, data);

    if (!user) {
      throw new AppError("User not found", HttpStatus.NOT_FOUND);
    }

    return UserMapper.toProfileDTO(user);
  }
}