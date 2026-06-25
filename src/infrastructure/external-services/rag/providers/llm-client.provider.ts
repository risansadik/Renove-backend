import { injectable } from "inversify";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { NON_TRANSIENT_STATUS_CODES, TRANSIENT_ERROR_KEYWORDS, TRANSIENT_ERROR_NAME_KEYWORDS, TRANSIENT_STATUS_CODES } from "@shared/constants";

const PRIMARY_MODEL = process.env.LLM_MODEL_NAME || "openai/gpt-4o-mini:free";

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
      model: FREE_MODELS[0],
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

  public async invokeWithFallback(
    prompt: PromptTemplate,
    variables: Record<string, unknown>
  ): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY!;
    let lastError: unknown;

    for (const model of FREE_MODELS) {
      const client = new ChatOpenAI({
        model,
        apiKey,
        temperature: 0.75,
        maxRetries: 0,
        configuration: {
          baseURL: process.env.LLM_BASE_URL,
          defaultHeaders: {
            "HTTP-Referer": process.env.APP_URL ?? "http://localhost:5000",
            "X-Title": "reNove",
          },
        },
      });

      try {
        const formatted: string = await prompt.format(variables);
        const response = await client.invoke(formatted);
        const content = response.content;

        const text =
          typeof content === "string"
            ? content
            : Array.isArray(content)
              ? content
                .map((c) =>
                  typeof c === "string" ? c : (c as { text?: string }).text ?? ""
                )
                .join("")
              : String(content);

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
}