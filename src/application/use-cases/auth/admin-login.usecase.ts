import bcrypt from "bcryptjs";
import type { IAdminRepository } from "../../../domain/repositories/admin.repository.ts";
import type { AdminLoginDTO } from "../../dto/auth/admin.dto.ts";
import { generateTokens } from "../../../shared/utils/jwt.ts";
import { NotFoundError, UnauthorizedError } from "../../../shared/utils/AppError.ts";
import { AdminMapper } from "../../mappers/admin.mapper.ts";
import { ROLES } from "../../../shared/constants/index.ts";

import type { IAdminLoginUseCase, ILoginResponse } from "../../interfaces/auth/IAuthUseCase.ts";

export class AdminLoginUseCase implements IAdminLoginUseCase {
  constructor(private readonly _adminRepo: IAdminRepository) {}

  async execute(dto: AdminLoginDTO): Promise<ILoginResponse> {
    const admin = await this._adminRepo.findByEmail(dto.email);
    if (!admin) throw new NotFoundError("Admin");

    const isMatch = await bcrypt.compare(dto.password, admin.password);
    if (!isMatch) throw new UnauthorizedError("Invalid credentials");

    const tokens = generateTokens({ id: admin.id, email: admin.email, role: ROLES.ADMIN });
    return { tokens, user: AdminMapper.toPublicDTO(admin) };
  }
}