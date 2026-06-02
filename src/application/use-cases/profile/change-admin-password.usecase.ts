import type { IAdminRepository } from "../../../domain/repositories/admin.repository.ts";
import { AppError } from "../../../shared/utils/AppError.ts";
import { HttpStatus } from "../../../shared/constants/index.ts";
import type { IPasswordHasher } from "../../interfaces/services/IPasswordHasher.ts";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import { IChangeAdminPasswordUseCase, IChangePasswordInput } from "../../interfaces/profile/IProfileUseCase.ts";

@injectable()
export class ChangeAdminPasswordUseCase implements IChangeAdminPasswordUseCase{
  constructor(
    @inject(TYPES.AdminRepository) private readonly _adminRepo: IAdminRepository,
    @inject(TYPES.PasswordHasher) private readonly _passwordHasher: IPasswordHasher
  ) {}

  async execute({id:adminId ,currentPasswordRaw,newPasswordRaw} : IChangePasswordInput) : Promise<boolean> {
    const admin = await this._adminRepo.findById(adminId);
    if (!admin) {
      throw new AppError("Admin not found", HttpStatus.NOT_FOUND);
    }

    if (!admin.password) {
      throw new AppError("Admin has no password set.", HttpStatus.BAD_REQUEST);
    }

    const isMatch = await this._passwordHasher.compare(currentPasswordRaw, admin.password);
    if (!isMatch) {
      throw new AppError("Incorrect current password", HttpStatus.UNAUTHORIZED);
    }

    const hashedPassword = await this._passwordHasher.hash(newPasswordRaw);
    await this._adminRepo.update(adminId, { password: hashedPassword });

    return true;
  }
}
