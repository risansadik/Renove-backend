import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import { LlmClientProvider } from "./providers/llm-client.provider.ts";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import type { IChatService, ChatTurn } from "../../../application/interfaces/services/rag/IChatService.ts";
import { ROLES } from "../../../shared/constants/index.ts";
import { SYSTEM_PROMPT } from "./prompts/chat.prompt.ts";

@injectable()
export class LangChainChatService implements IChatService {
  private readonly _llm;

  constructor(
    @inject(TYPES.LlmClient) private readonly _llmProvider: LlmClientProvider
  ) {

    this._llm = this._llmProvider.getStreamingClient();
  }

  async streamReply(
    _userId: string,
    userMessage: string,
    history: ChatTurn[],
    onToken: (token: string) => void
  ): Promise<string> {
    const messages = [
      new SystemMessage(SYSTEM_PROMPT),
      ...history.map((t) =>
        t.role === ROLES.USER ? new HumanMessage(t.content) : new AIMessage(t.content)
      ),
      new HumanMessage(userMessage),
    ];

    let fullText = "";

    const stream = await this._llm.stream(messages);

    for await (const chunk of stream) {
      const token = typeof chunk.content === "string" ? chunk.content : "";
      if (token) {
        fullText += token;
        onToken(token);
      }
    }

    return fullText;
  }
}