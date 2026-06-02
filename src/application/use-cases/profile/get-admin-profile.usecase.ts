import type { IAdminRepository } from "../../../domain/repositories/admin.repository.ts";
import { AppError } from "../../../shared/utils/AppError.ts";
import { HttpStatus } from "../../../shared/constants/index.ts";
import { AdminMapper, PublicAdminDTO } from "../../mappers/admin.mapper.ts";
import { IGetAdminProfileUseCase } from "../../interfaces/profile/IProfileUseCase.ts";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";

@injectable()
export class GetAdminProfileUseCase implements IGetAdminProfileUseCase{
  constructor(
    @inject(TYPES.AdminRepository) private readonly _adminRepo: IAdminRepository) {}

  async execute(adminId: string) : Promise<PublicAdminDTO> {
    const admin = await this._adminRepo.findById(adminId);
    if (!admin) {
      throw new AppError("Admin not found", HttpStatus.NOT_FOUND);
    }
    return AdminMapper.toProfileDTO(admin);
  }
}
