import { injectable } from "inversify";
import { OAuth2Client } from "google-auth-library";
import { AppError } from "../../shared/utils/AppError.ts";
import { GOOGLE_CONFIG, HttpStatus } from "../../shared/constants/index.ts";
import type { IGoogleService } from "../../application/interfaces/services/IGoogleService.ts";

export interface GoogleUserPayload {
  email: string;
  name: string;
  picture?: string;
  sub: string;
}

interface GoogleUserInfo {
  email: string;
  name: string;
  sub: string;
  picture?: string;
}

@injectable()
export class GoogleService implements IGoogleService {
  public async verifyGoogleToken(token: string): Promise<GoogleUserPayload> {
    if (!GOOGLE_CONFIG.CLIENT_ID) {
      throw new AppError("Google Client ID is not configured", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const client = new OAuth2Client(GOOGLE_CONFIG.CLIENT_ID);

    // If token is an OAuth2 Access Token (does not have JWT segments/dots, or starts with standard google access token prefix 'ya29.')
    const isAccessToken = !token.includes(".") || token.startsWith("ya29.");

    if (isAccessToken) {
      client.setCredentials({ access_token: token });
      const response = await client.request<GoogleUserInfo>({
        url: "https://www.googleapis.com/oauth2/v3/userinfo",
      }).catch((error) => {
        console.error("Google access token verification error details:", error);
        throw new AppError("Failed to verify Google access token", HttpStatus.UNAUTHORIZED);
      });

      const payload = response.data;
      if (!payload?.email || !payload?.name || !payload?.sub) {
        throw new AppError("Invalid Google token: Missing profile information", HttpStatus.UNAUTHORIZED);
      }

      return {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        sub: payload.sub,
      };
    }

    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CONFIG.CLIENT_ID,
      }).catch((error) => {
        console.error("Google ID token verification error details:", error);
        throw new AppError("Failed to verify Google token", HttpStatus.UNAUTHORIZED);
      });

    const payload = ticket.getPayload();

    if (!payload?.email || !payload?.name || !payload?.sub) {
      throw new AppError("Invalid Google token: Missing profile information", HttpStatus.UNAUTHORIZED);
    }

    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      sub: payload.sub,
    };
  }
}
