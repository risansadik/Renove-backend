import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import type { IAdminRepository } from "../../../domain/repositories/admin.repository.ts";
import type { AdminLoginDTO } from "../../dto/auth/admin.dto.ts";
import { NotFoundError, UnauthorizedError } from "../../../shared/utils/AppError.ts";
import { AdminMapper } from "../../mappers/admin.mapper.ts";
import { ROLES } from "../../../shared/constants/index.ts";
import type { IAdminLoginUseCase, ILoginResponse } from "../../interfaces/auth/IAuthUseCase.ts";
import type { IPasswordHasher } from "../../interfaces/services/IPasswordHasher.ts";
import type { ITokenService } from "../../interfaces/services/ITokenService.ts";

@injectable()
export class AdminLoginUseCase implements IAdminLoginUseCase {
  constructor(
    @inject(TYPES.AdminRepository) private readonly _adminRepo: IAdminRepository,
    @inject(TYPES.PasswordHasher) private readonly _passwordHasher: IPasswordHasher,
    @inject(TYPES.TokenService) private readonly _tokenService: ITokenService
  ) {}

  async execute(dto: AdminLoginDTO): Promise<ILoginResponse> {
    const admin = await this._adminRepo.findByEmail(dto.email);
    if (!admin) throw new NotFoundError("Admin");

    const isMatch = await this._passwordHasher.compare(dto.password, admin.password);
    if (!isMatch) throw new UnauthorizedError("Invalid credentials");

    const tokens = this._tokenService.generateTokens({ id: admin.id, email: admin.email, role: ROLES.ADMIN });
    return { tokens, user: AdminMapper.toPublicDTO(admin) };
  }
}
