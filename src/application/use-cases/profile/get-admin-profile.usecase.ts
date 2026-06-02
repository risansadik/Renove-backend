import type { IAdminRepository } from "../../../domain/repositories/admin.repository.ts";
import { AppError } from "../../../shared/utils/AppError.ts";
import { HttpStatus } from "../../../shared/constants/index.ts";
import { AdminMapper } from "../../mappers/admin.mapper.ts";

export class GetAdminProfileUseCase {
  constructor(private readonly _adminRepo: IAdminRepository) {}

  async execute(adminId: string) {
    const admin = await this._adminRepo.findById(adminId);
    if (!admin) {
      throw new AppError("Admin not found", HttpStatus.NOT_FOUND);
    }
    return AdminMapper.toProfileDTO(admin);
  }
}
