import bcrypt from "bcryptjs";
import type { IAdminRepository } from "../../../domain/repositories/admin.repository.js";
import type { AdminLoginDTO } from "../../dto/auth/admin.dto.js";
import { generateTokens } from "../../../shared/utils/jwt.js";
import { NotFoundError, UnauthorizedError } from "../../../shared/utils/AppError.js";
import { AdminMapper } from "../../mappers/admin.mapper.js";
import { ROLES } from "../../../shared/constants/index.js";

import type { IAdminLoginUseCase, ILoginResponse } from "../../interfaces/auth/IAuthUseCase.js";

export class AdminLoginUseCase implements IAdminLoginUseCase {
  constructor(private readonly adminRepo: IAdminRepository) {}

  async execute(dto: AdminLoginDTO): Promise<ILoginResponse> {
    const admin = await this.adminRepo.findByEmail(dto.email);
    if (!admin) throw new NotFoundError("Admin");

    const isMatch = await bcrypt.compare(dto.password, admin.password);
    if (!isMatch) throw new UnauthorizedError("Invalid credentials");

    const tokens = generateTokens({ id: admin.id, email: admin.email, role: ROLES.ADMIN });
    return { tokens, user: AdminMapper.toPublicDTO(admin) };
  }
}