import type { IUserRepository } from "../../../domain/repositories/user.repository.js";
import type { UpdateUserStatusDTO } from "../../dto/auth/admin.dto.js";
import { NotFoundError } from "../../../shared/utils/AppError.js";

import type { IUpdateUserStatusUseCase } from "../../interfaces/admin/IAdminUseCase.js";

export class UpdateUserStatusUseCase implements IUpdateUserStatusUseCase {
  constructor(private readonly _userRepo: IUserRepository) {}

  async execute({ id, dto }: { id: string; dto: UpdateUserStatusDTO }): Promise<{ id: string; status: string }> {
    const user = await this._userRepo.findById(id);
    if (!user) throw new NotFoundError("User");

    await this._userRepo.updateStatus(id, dto.status);
    return { id, status: dto.status };
  }
}
