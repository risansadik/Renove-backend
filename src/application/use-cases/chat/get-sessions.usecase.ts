import { inject, injectable } from "inversify";
import { IGetSessionsUseCase } from "../../interfaces/chat/IChatUseCase";
import { TYPES } from "../../../shared/constants/tokens";
import type { IChatMessageRepository } from "../../../domain/repositories/chat-message.repository";
import { ChatSessionEntity } from "../../../domain/entities/ChatSession.entity";

@injectable()
export class GetSessionsUseCase implements IGetSessionsUseCase {
  constructor(
    @inject(TYPES.ChatMessageRepository) private readonly _chatRepo: IChatMessageRepository
  ) {}

  async execute(userId: string): Promise<ChatSessionEntity[]> {
    return this._chatRepo.getSessions(userId);
  }
}