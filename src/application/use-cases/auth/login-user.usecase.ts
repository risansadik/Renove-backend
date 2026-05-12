import bcrypt from "bcryptjs";
import type { IUserRepository } from "../../../domain/repositories/user.repository.js";
import type { LoginUserDTO } from "../../dto/auth/user.dto.js";
import { generateTokens } from "../../../shared/utils/jwt.js";
import { AppError, NotFoundError, UnauthorizedError } from "../../../shared/utils/AppError.js";
import { UserMapper } from "../../mappers/user.mapper.js";
import { ROLES, USER_STATUS } from "../../../shared/constants/index.js";

export class LoginUserUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(dto: LoginUserDTO) {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) throw new NotFoundError("User");
    if (!user.password) throw new AppError("Use Google sign-in for this account");
    if (!user.isVerified) throw new AppError("Please verify your email first", 403);
    if (user.status === USER_STATUS.BLOCKED) throw new AppError("Your account has been blocked", 403);

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedError("Invalid credentials");

    const tokens = generateTokens({ id: user.id, email: user.email, role: ROLES.USER });
    return { tokens, user: UserMapper.toPublicDTO(user) };
  }
}
