import { inject, injectable } from "inversify";
import { IGetSessionsUseCase } from "../../interfaces/chat/IChatUseCase.ts";
import { TYPES } from "../../../shared/constants/tokens.ts";
import { IChatMessageRepository } from "../../../domain/repositories/chat-message.repository.ts";
import { ChatSessionEntity } from "../../../domain/entities/ChatSession.entity.ts";

@injectable()
export class GetSessionsUseCase implements IGetSessionsUseCase {
  constructor(
    @inject(TYPES.ChatMessageRepository) private readonly _chatRepo: IChatMessageRepository
  ) {}

  async execute(userId: string): Promise<ChatSessionEntity[]> {
    return this._chatRepo.getSessions(userId);
  }
}