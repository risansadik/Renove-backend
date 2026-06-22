import type { IAdminRepository } from "../../../domain/repositories/admin.repository";
import { AppError } from "../../../shared/utils/AppError";
import { HttpStatus } from "../../../shared/constants/index";
import { AdminMapper, PublicAdminDTO } from "../../mappers/admin.mapper";
import { IGetAdminProfileUseCase } from "../../interfaces/profile/IProfileUseCase";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/constants/tokens";

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
