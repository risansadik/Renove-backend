import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import type { IUserRepository } from "../../../domain/repositories/user.repository.ts";
import type { LoginUserDTO } from "../../dto/auth/user.dto.ts";
import { AppError, NotFoundError, UnauthorizedError } from "../../../shared/utils/AppError.ts";
import { HttpStatus, ROLES, USER_STATUS } from "../../../shared/constants/index.ts";
import type { ILoginUserUseCase, ILoginResponse } from "../../interfaces/auth/IAuthUseCase.ts";
import type { IPasswordHasher } from "../../interfaces/services/IPasswordHasher.ts";
import type { ITokenService } from "../../interfaces/services/ITokenService.ts";
import { UserMapper } from "../../mappers/user.mapper.ts";

@injectable()
export class LoginUserUseCase implements ILoginUserUseCase {
  constructor(
    @inject(TYPES.UserRepository) private readonly _userRepo: IUserRepository,
    @inject(TYPES.PasswordHasher) private readonly _passwordHasher: IPasswordHasher,
    @inject(TYPES.TokenService) private readonly _tokenService: ITokenService
  ) {}

  async execute(dto: LoginUserDTO): Promise<ILoginResponse> {
    const user = await this._userRepo.findByEmail(dto.email);
    if (!user) throw new NotFoundError("User");
    if (!user.password) throw new AppError("Use Google sign-in for this account");
    if (!user.isVerified) throw new AppError("Please verify your email first", HttpStatus.FORBIDDEN);
    if (user.status === USER_STATUS.BLOCKED) throw new AppError("Your account has been blocked", HttpStatus.FORBIDDEN);

    const isMatch = await this._passwordHasher.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedError("Invalid credentials");

    const tokens = this._tokenService.generateTokens({ id: user.id, email: user.email, role: ROLES.USER });
    return { tokens, user: UserMapper.toPublicDTO(user) };
  }
}
