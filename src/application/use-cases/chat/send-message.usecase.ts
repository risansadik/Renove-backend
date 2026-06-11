import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import type { IChatService, ChatTurn } from "../../interfaces/services/rag/IChatService.ts";
import type { IChatMessageRepository } from "../../../domain/repositories/chat-message.repository.ts";
import type {
  ISendMessageUseCase,
  ISendMessageInput,
} from "../../interfaces/chat/IChatUseCase.ts";

@injectable()
export class SendMessageUseCase implements ISendMessageUseCase {
  constructor(
    @inject(TYPES.ChatService) private readonly _chatService: IChatService,
    @inject(TYPES.ChatMessageRepository) private readonly _chatRepo: IChatMessageRepository
  ) {}

  async execute(input: ISendMessageInput): Promise<void> {
    const rawHistory = await this._chatRepo.getSessionMessages(input.userId, input.sessionId, 20);

    const history: ChatTurn[] = rawHistory.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    await this._chatRepo.saveMessage({
      userId: input.userId,
      sessionId: input.sessionId,
      role: "user",
      content: input.message,
    });

    const fullReply = await this._chatService.streamReply(
      input.userId,
      input.message,
      history,
      input.onToken
    );

    await this._chatRepo.saveMessage({
      userId: input.userId,
      sessionId: input.sessionId,
      role: "assistant",
      content: fullReply,
    });
  }
}