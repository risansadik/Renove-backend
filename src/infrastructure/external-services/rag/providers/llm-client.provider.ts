import { injectable } from "inversify";
import { GoogleGenerativeAI, Content } from "@google/generative-ai";
import { PromptTemplate } from "@langchain/core/prompts";
import { BaseMessage } from "@langchain/core/messages";
import { NON_TRANSIENT_STATUS_CODES, TRANSIENT_ERROR_KEYWORDS, TRANSIENT_ERROR_NAME_KEYWORDS, TRANSIENT_STATUS_CODES } from "@shared/constants";

const PRIMARY_MODEL = process.env.LLM_MODEL_NAME || "gemini-2.5-flash";

const FALLBACK_MODELS: string[] = (process.env.LLM_FALLBACK_MODELS ?? "")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

const FREE_MODELS: string[] = [PRIMARY_MODEL, ...FALLBACK_MODELS];

function isTransientError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;

  const status =
    (err as unknown as Record<string, unknown>)["status"] as number | undefined ??
    (err as unknown as Record<string, unknown>)["statusCode"] as number | undefined;

  if (status !== undefined && NON_TRANSIENT_STATUS_CODES.has(status)) return false;
  if (status !== undefined && TRANSIENT_STATUS_CODES.has(status)) return true;

  const msg = err.message.toLowerCase();
  const name = err.name.toLowerCase();

  return (
    TRANSIENT_ERROR_NAME_KEYWORDS.some((k) => name.includes(k)) ||
    TRANSIENT_ERROR_KEYWORDS.some((k) => msg.includes(k))
  );
}

function toGeminiContents(messages: BaseMessage[]): { systemInstruction?: string; contents: Content[] } {
  let systemInstruction: string | undefined;
  const contents: Content[] = [];

  for (const m of messages) {
    const type = m._getType();
    const text = typeof m.content === "string" ? m.content : String(m.content);

    if (type === "system") {
      systemInstruction = text;
      continue;
    }

    contents.push({
      role: type === "ai" ? "model" : "user",
      parts: [{ text }],
    });
  }

  return { systemInstruction, contents };
}

@injectable()
export class LlmClientProvider {
  private readonly _client: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("CRITICAL: GEMINI_API_KEY environment variable is missing.");
    }
    this._client = new GoogleGenerativeAI(apiKey);
  }

  public async invokeWithFallback(
    prompt: PromptTemplate,
    variables: Record<string, unknown>
  ): Promise<string> {
    let lastError: unknown;

    for (const model of FREE_MODELS) {
      try {
        const formatted: string = await prompt.format(variables);
        const genModel = this._client.getGenerativeModel({ model });
        const result = await genModel.generateContent(formatted);

        const text = result.response.text();
        if (!text) {
          throw new Error(`Model "${model}" returned empty response.`);
        }

        console.info(`[LlmClientProvider] Success with model: ${model}`);
        return text;
      } catch (err: unknown) {
        if (isTransientError(err)) {
          console.warn(
            `[LlmClientProvider] Transient error on model "${model}", trying next. Error: ${err instanceof Error ? err.message : String(err)
            }`
          );
          lastError = err;
          continue;
        }
        throw err;
      }
    }

    throw lastError ?? new Error("[LlmClientProvider] All fallback models exhausted.");
  }

  public async streamWithFallback(
    messages: BaseMessage[],
    onToken: (token: string) => void
  ): Promise<string> {
    let lastError: unknown;
    const { systemInstruction, contents } = toGeminiContents(messages);

    for (const model of FREE_MODELS) {
      let fullText = "";

      try {
        const genModel = this._client.getGenerativeModel({
          model,
          ...(systemInstruction ? { systemInstruction } : {}),
        });

        const result = await genModel.generateContentStream({ contents });

        for await (const chunk of result.stream) {
          const token = chunk.text();
          if (token) {
            fullText += token;
            onToken(token);
          }
        }

        console.info(`[LlmClientProvider] Streaming success with model: ${model}`);
        return fullText;
      } catch (err: unknown) {
        if (isTransientError(err) && fullText === "") {
          console.warn(
            `[LlmClientProvider] Transient streaming error on model "${model}", trying next. Error: ${err instanceof Error ? err.message : String(err)
            }`
          );
          lastError = err;
          continue;
        }
        throw err;
      }
    }

    throw lastError ?? new Error("[LlmClientProvider] All fallback models exhausted (streaming).");
  }
}