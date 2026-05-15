import type { IUserRepository } from "../../../domain/repositories/user.repository.js";
import { UserMapper } from "../../mappers/user.mapper.js";

import type { IGetAllUsersUseCase } from "../../interfaces/admin/IAdminUseCase.js";
import type { PublicUserDTO } from "../../mappers/user.mapper.js";

export class GetAllUsersUseCase implements IGetAllUsersUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(): Promise<PublicUserDTO[]> {
    const users = await this.userRepo.findAll();
    return users.map(UserMapper.toPublicDTO);
  }
}
