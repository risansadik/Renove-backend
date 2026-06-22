import type { GoogleUserPayload } from "../../../infrastructure/external-services/google.service";

export interface IGoogleService {
  verifyGoogleToken(token: string): Promise<GoogleUserPayload>;
}
