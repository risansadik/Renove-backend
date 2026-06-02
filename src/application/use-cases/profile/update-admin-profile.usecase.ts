import type { IAdminRepository } from "../../../domain/repositories/admin.repository.ts";
import { AppError } from "../../../shared/utils/AppError.ts";
import { HttpStatus } from "../../../shared/constants/index.ts";
import { AdminMapper } from "../../mappers/admin.mapper.ts";

export interface UpdateAdminProfileDto {
  name?: string;
  profileImage?: string;
}

export class UpdateAdminProfileUseCase {
  constructor(private readonly _adminRepo: IAdminRepository) {}

  async execute(adminId: string, data: UpdateAdminProfileDto) {
    const admin = await this._adminRepo.update(adminId, data);

    if (!admin) {
      throw new AppError("Admin not found", HttpStatus.NOT_FOUND);
    }

    return AdminMapper.toProfileDTO(admin);
  }
}
