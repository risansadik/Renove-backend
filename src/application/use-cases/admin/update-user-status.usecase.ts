import type { IUserRepository } from "../../../domain/repositories/user.repository.js";
import type { UpdateUserStatusDTO } from "../../dto/auth/admin.dto.js";
import { NotFoundError } from "../../../shared/utils/AppError.js";

export class UpdateUserStatusUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(id: string, dto: UpdateUserStatusDTO) {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundError("User");

    await this.userRepo.updateStatus(id, dto.status);
    return { id, status: dto.status };
  }
}
