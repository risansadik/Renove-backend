import { injectable } from "inversify";
import type { AuthTokens, ITokenService, TokenPayload } from "../../application/interfaces/services/ITokenService.ts";
import { authTokenService } from "../../shared/utils/jwt.ts";

@injectable()
export class JwtTokenService implements ITokenService {
  generateTokens(payload: TokenPayload): AuthTokens {
    return authTokenService.generateTokens(payload);
  }

  verifyAccessToken(token: string): TokenPayload {
    return authTokenService.verifyAccessToken(token);
  }

  verifyRefreshToken(token: string): TokenPayload {
    return authTokenService.verifyRefreshToken(token);
  }
}
