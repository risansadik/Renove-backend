import { injectable } from "inversify";
import { OAuth2Client } from "google-auth-library";
import { AppError } from "../../shared/utils/AppError";
import { GOOGLE_CONFIG, HttpStatus } from "../../shared/constants/index";
import type { IGoogleService } from "../../application/interfaces/services/IGoogleService";

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

    const isAccessToken = !token.includes(".") || token.startsWith("ya29.");

    if (isAccessToken) {
      const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch((error) => {
        console.error("Google access token verification error details:", error);
        throw new AppError("Failed to verify Google access token", HttpStatus.UNAUTHORIZED);
      });

      if (!response.ok) {
        console.error("Google userinfo failed with status:", response.status);
        throw new AppError("Failed to verify Google access token", HttpStatus.UNAUTHORIZED);
      }

      const payload = await response.json() as GoogleUserInfo;

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

    const client = new OAuth2Client(GOOGLE_CONFIG.CLIENT_ID);

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
