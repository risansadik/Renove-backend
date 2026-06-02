import type { GoogleUserPayload } from "../../../infrastructure/external-services/google.service.ts";

export interface IGoogleService {
  verifyGoogleToken(token: string): Promise<GoogleUserPayload>;
}
