import { OAuth2Client } from "google-auth-library";
import { AppError } from "../../shared/utils/AppError";
import { GOOGLE_CONFIG, HttpStatus } from "../../shared/constants/index";

export interface GoogleUserPayload {
  email: string;
  name: string;
  picture?: string;
  sub: string;
}

export const verifyGoogleToken = async (idToken: string): Promise<GoogleUserPayload> => {
  if (!GOOGLE_CONFIG.CLIENT_ID) {
    throw new AppError("Google Client ID is not configured", HttpStatus.INTERNAL_SERVER_ERROR);
  }

  const client = new OAuth2Client(GOOGLE_CONFIG.CLIENT_ID);

  try {
    const ticket = await client.verifyIdToken({
      idToken,
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
  } catch (error : any) {

    if (error instanceof AppError) throw error;

     console.error("GOOGLE LIBRARY ERROR:", error.message); 
    throw new AppError("Failed to verify Google token", HttpStatus.UNAUTHORIZED);
  }
};
