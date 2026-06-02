import { injectable } from "inversify";
import type { AuthTokens, ITokenService, TokenPayload } from "../../application/interfaces/services/ITokenService.ts";
import { generateTokens, verifyAccessToken, verifyRefreshToken } from "../../shared/utils/jwt.ts";

@injectable()
export class JwtTokenService implements ITokenService {
  generateTokens(payload: TokenPayload): AuthTokens {
    return generateTokens(payload);
  }

  verifyAccessToken(token: string): TokenPayload {
    return verifyAccessToken(token);
  }

  verifyRefreshToken(token: string): TokenPayload {
    return verifyRefreshToken(token);
  }
}
