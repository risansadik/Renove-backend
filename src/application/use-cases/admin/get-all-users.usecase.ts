import type { IUserRepository } from "../../../domain/repositories/user.repository.js";
import { UserMapper } from "../../mappers/user.mapper.js";

export class GetAllUsersUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute() {
    const users = await this.userRepo.findAll();
    return users.map(UserMapper.toPublicDTO);
  }
}
