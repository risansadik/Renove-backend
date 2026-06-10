// src/infrastructure/external-services/qdrant-client.provider.ts
import { injectable } from "inversify";
import { QdrantClient } from "@qdrant/js-client-rest";

@injectable()
export class QdrantClientProvider {
  private readonly _client: QdrantClient;

  constructor() {
    const url = process.env.QDRANT_URL;
    const apiKey = process.env.QDRANT_API_KEY;

    if (!url || !apiKey) {
      throw new Error("CRITICAL: QDRANT_URL or QDRANT_API_KEY environment variable is missing.");
    }

    this._client = new QdrantClient({
      url: url,
      apiKey: apiKey,
    });
  }

  public getClient(): QdrantClient {
    return this._client;
  }
}