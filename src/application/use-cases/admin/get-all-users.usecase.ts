import type { IUserRepository } from "../../../domain/repositories/user.repository.ts";
import { UserMapper } from "../../mappers/user.mapper.ts";

import type { IGetAllUsersUseCase } from "../../interfaces/admin/IAdminUseCase.ts";
import type { PublicUserDTO } from "../../mappers/user.mapper.ts";
import type { PaginationParams, PaginatedResult } from "../../../domain/interfaces/pagination.ts";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";

@injectable()
export class GetAllUsersUseCase implements IGetAllUsersUseCase {
  constructor(
   @inject(TYPES.UserRepository) private readonly _userRepo: IUserRepository
  ) {}

  async execute(params: PaginationParams): Promise<PaginatedResult<PublicUserDTO>> {
    const result = await this._userRepo.findAll(params);
    return {
      data: result.data.map(UserMapper.toPublicDTO),
      total: result.total
    };
  }
}
