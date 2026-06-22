import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/constants/tokens";
import type { IAdminRepository } from "../../../domain/repositories/admin.repository";
import { AppError } from "../../../shared/utils/AppError";
import { HttpStatus } from "../../../shared/constants/index";
import { AdminMapper, PublicAdminDTO } from "../../mappers/admin.mapper";
import type { IUpdateAdminProfileUseCase, IUpdateAdminProfileInput } from "../../interfaces/profile/IProfileUseCase";

export interface UpdateAdminProfileDto {
  name?: string;
  profileImage?: string;
}

@injectable()
export class UpdateAdminProfileUseCase implements IUpdateAdminProfileUseCase {
  constructor(
    @inject(TYPES.AdminRepository) private readonly _adminRepo: IAdminRepository
  ) {}

  // Fixed: Parameters packed into unified input payload object
  async execute({ adminId, data }: IUpdateAdminProfileInput): Promise<PublicAdminDTO> {
    const admin = await this._adminRepo.update(adminId, data);

    if (!admin) {
      throw new AppError("Admin not found", HttpStatus.NOT_FOUND);
    }

    return AdminMapper.toProfileDTO(admin);
  }
}