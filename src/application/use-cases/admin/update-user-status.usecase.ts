import type { IUserRepository } from "../../../domain/repositories/user.repository.ts";
import type { UpdateUserStatusDTO } from "../../dto/auth/admin.dto.ts";
import { NotFoundError } from "../../../shared/utils/AppError.ts";

import type { IUpdateUserStatusUseCase } from "../../interfaces/admin/IAdminUseCase.ts";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";

@injectable()
export class UpdateUserStatusUseCase implements IUpdateUserStatusUseCase {
  constructor(
    @inject(TYPES.UserRepository) private readonly _userRepo: IUserRepository
  ) {}

  async execute({ id, dto }: { id: string; dto: UpdateUserStatusDTO }): Promise<{ id: string; status: string }> {
    const user = await this._userRepo.findById(id);
    if (!user) throw new NotFoundError("User");

    await this._userRepo.updateStatus(id, dto.status);
    return { id, status: dto.status };
  }
}
