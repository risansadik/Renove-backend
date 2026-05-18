import { OAuth2Client } from "google-auth-library";
import { AppError } from "../../shared/utils/AppError.js";
import { GOOGLE_CONFIG, HttpStatus } from "../../shared/constants/index.js";

export interface GoogleUserPayload {
  email: string;
  name: string;
  picture?: string;
  sub: string;
}

export const verifyGoogleToken = async (token: string): Promise<GoogleUserPayload> => {
  if (!GOOGLE_CONFIG.CLIENT_ID) {
    throw new AppError("Google Client ID is not configured", HttpStatus.INTERNAL_SERVER_ERROR);
  }

  const client = new OAuth2Client(GOOGLE_CONFIG.CLIENT_ID);

  // If token is an OAuth2 Access Token (does not have JWT segments/dots, or starts with standard google access token prefix 'ya29.')
  const isAccessToken = !token.includes(".") || token.startsWith("ya29.");

  if (isAccessToken) {
    try {
      const response = await client.request<any>({
        url: "https://www.googleapis.com/oauth2/v3/userinfo",
        headers: { Authorization: `Bearer ${token}` },
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
    } catch (error) {
      throw new AppError("Failed to verify Google access token", HttpStatus.UNAUTHORIZED);
    }
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CONFIG.CLIENT_ID,
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
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to verify Google token", HttpStatus.UNAUTHORIZED);
  }
};
