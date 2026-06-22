import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens";
import type { IAdminRepository } from "../../../domain/repositories/admin.repository";
import type { AdminLoginDTO } from "../../dto/auth/admin.dto";
import { NotFoundError, UnauthorizedError } from "../../../shared/utils/AppError";
import { AdminMapper } from "../../mappers/admin.mapper";
import { ROLES } from "../../../shared/constants/index";
import type { IAdminLoginUseCase, ILoginResponse } from "../../interfaces/auth/IAuthUseCase";
import type { IPasswordHasher } from "../../interfaces/services/IPasswordHasher";
import type { ITokenService } from "../../interfaces/services/ITokenService";

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
