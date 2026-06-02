import type { IAdminRepository } from "../../../domain/repositories/admin.repository.ts";
import { AppError } from "../../../shared/utils/AppError.ts";
import { HttpStatus } from "../../../shared/constants/index.ts";
import type { IPasswordHasher } from "../../interfaces/services/IPasswordHasher.ts";

export class ChangeAdminPasswordUseCase {
  constructor(
    private readonly _adminRepo: IAdminRepository,
    private readonly _passwordHasher: IPasswordHasher
  ) {}

  async execute(adminId: string, currentPasswordRaw: string, newPasswordRaw: string) {
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
