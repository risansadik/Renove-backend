import { injectable } from "inversify";
import { ChatOpenAI } from "@langchain/openai";

@injectable()
export class LlmClientProvider {
  private readonly _client: ChatOpenAI;
  private readonly _streamingClient: ChatOpenAI;

  constructor() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("CRITICAL: OPENROUTER_API_KEY environment variable is missing.");
    }

    const config = {
      model: process.env.LLM_MODEL_NAME || "openai/gpt-oss-120b:free",
      apiKey,
      configuration: {
        baseURL: process.env.LLM_BASE_URL,
        defaultHeaders: {
          "HTTP-Referer": process.env.APP_URL ?? "http://localhost:5000",
          "X-Title": "reNove",
        },
      },
    };

    this._client = new ChatOpenAI({ ...config, temperature: 0.75 });
    this._streamingClient = new ChatOpenAI({ ...config, temperature: 0.75, streaming: true });
  }

  public getClient(): ChatOpenAI {
    return this._client;
  }

  public getStreamingClient(): ChatOpenAI {
    return this._streamingClient;
  }
}