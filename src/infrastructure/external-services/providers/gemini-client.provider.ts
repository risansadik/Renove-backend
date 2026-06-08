import { injectable } from "inversify";
import { GoogleGenerativeAI } from "@google/generative-ai";

@injectable()
export class GeminiClientProvider {
  private readonly _client: GoogleGenerativeAI;
  private readonly _embeddingModel: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("CRITICAL: GEMINI_API_KEY environment variable is missing.");
    }

    this._embeddingModel = process.env.GEMINI_EMBEDDING_MODEL!;
    this._client = new GoogleGenerativeAI(apiKey);
  }

  public getClient(): GoogleGenerativeAI {
    return this._client;
  }

  public getEmbeddingModelName(): string {
    return this._embeddingModel;
  }
}