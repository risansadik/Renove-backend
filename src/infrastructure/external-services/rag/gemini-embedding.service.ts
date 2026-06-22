// src/infrastructure/external-services/gemini-embedding.service.ts
import { injectable, inject } from "inversify";
import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";
import { IEmbeddingService } from "../../../application/interfaces/services/rag/IEmbeddingService";
import { GeminiClientProvider } from "./providers/gemini-client.provider";
import { TYPES } from "../../../shared/constants/tokens";
import { ROLES } from "../../../shared/constants/index";

@injectable()
export class GeminiEmbeddingService implements IEmbeddingService {
  private readonly _client: GoogleGenerativeAI;
  private readonly _modelName: string;

  constructor(
    @inject(TYPES.GeminiClient) private readonly _geminiProvider: GeminiClientProvider
  ) {
    this._client = this._geminiProvider.getClient();
    this._modelName = this._geminiProvider.getEmbeddingModelName();
  }

  async embed(text: string): Promise<number[]> {
  const model = this._client.getGenerativeModel({ model: this._modelName });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

 async embedBatch(texts: string[]): Promise<number[][]> {
    if (!texts.length) return [];

    const model = this._client.getGenerativeModel({ model: this._modelName });
    
    const result = await model.batchEmbedContents({
      requests: texts.map((text) => ({
        model: `models/${this._modelName}`,
        content: { 
          role: ROLES.USER,
          parts: [{ text }] 
        },
        taskType: TaskType.RETRIEVAL_DOCUMENT,
      })),
    });

    return result.embeddings.map((e) => e.values);
  }
}