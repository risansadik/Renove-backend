import { inject, injectable } from "inversify";
import { ChatMessageEntity } from "../../../domain/entities/ChatMessage.entity.ts";
import { TYPES } from "../../../shared/constants/tokens.ts";
import { IChatMessageRepository } from "../../../domain/repositories/chat-message.repository.ts";
import { IGetSessionMessagesUseCase } from "../../interfaces/chat/IChatUseCase.ts";

@injectable()
export class GetSessionMessagesUseCase implements IGetSessionMessagesUseCase {
  constructor(
    @inject(TYPES.ChatMessageRepository) private readonly _chatRepo: IChatMessageRepository
  ) {}

  async execute({ userId, sessionId }: { userId: string; sessionId: string }): Promise<
    Pick<ChatMessageEntity, "role" | "content" | "createdAt">[]>
   {
    return this._chatRepo.getSessionMessages(userId, sessionId, 50);
  }
}