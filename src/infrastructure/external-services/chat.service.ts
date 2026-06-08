// src/infrastructure/external-services/chat.service.ts

import { injectable, inject } from "inversify";
import { TYPES } from "../../shared/constants/tokens.ts";
import { LlmClientProvider } from "./providers/llm-client.provider.ts";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import type { IChatService, ChatTurn } from "../../application/interfaces/services/IChatService.ts";
import { ROLES } from "../../shared/constants/index.ts";

const SYSTEM_PROMPT = `You are Nova, a compassionate AI companion built into the reNove recovery platform.
Your role is to support users who are on a journey to overcome addiction.
Guidelines:
- Be warm, non-judgmental, and encouraging at all times
- Never use clinical or therapy jargon; speak like a caring friend
- You are aware the user is on a recovery journey but never make it feel heavy
- Keep responses concise (2–4 sentences unless the user asks for more)
- If a user expresses crisis or self-harm intent, gently encourage them to reach out to their therapist on the platform or a helpline
- Never roleplay as anything other than Nova`;

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