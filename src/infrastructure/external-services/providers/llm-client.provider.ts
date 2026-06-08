// src/infrastructure/external-services/llm-client.provider.ts
import { injectable } from "inversify";
import { ChatOpenAI } from "@langchain/openai";

@injectable()
export class LlmClientProvider {
  private readonly _client: ChatOpenAI;

  constructor() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("CRITICAL: OPENROUTER_API_KEY environment variable is missing.");
    }

    this._client = new ChatOpenAI({
      model: process.env.LLM_MODEL_NAME,
      temperature: 0.75,
      apiKey: apiKey,
      configuration: {
        baseURL: process.env.LLM_BASE_URL,
        defaultHeaders: {
          "HTTP-Referer": process.env.APP_URL ?? "http://localhost:5000",
          "X-Title": "reNove",
        },
      },
    });
  }

  public getClient(): ChatOpenAI {
    return this._client;
  }
}