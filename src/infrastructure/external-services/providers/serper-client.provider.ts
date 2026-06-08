// src/infrastructure/external-services/serper-client.provider.ts
import { injectable } from "inversify";

@injectable()
export class SerperClientProvider {
  private readonly _apiKey: string;
  private readonly _endpoint: string;

  constructor() {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
      throw new Error("CRITICAL: SERPER_API_KEY environment variable is missing.");
    }

    this._apiKey = apiKey;
    this._endpoint = process.env.SERPER_API_ENDPOINT!
  }

  public getApiKey(): string {
    return this._apiKey;
  }

  public getEndpoint(): string {
    return this._endpoint;
  }
}