import { inject, injectable } from "inversify";
import { IDeleteSessionUseCase } from "../../interfaces/chat/IChatUseCase";
import { TYPES } from "../../../shared/constants/tokens";
import type { IChatMessageRepository } from "../../../domain/repositories/chat-message.repository";

@injectable()
export class DeleteSessionUseCase implements IDeleteSessionUseCase {
  constructor(
    @inject(TYPES.ChatMessageRepository) private readonly _chatRepo: IChatMessageRepository
  ) {}

  async execute({ userId, sessionId }: { userId: string; sessionId: string }): Promise<void> {
    return this._chatRepo.deleteSession(userId, sessionId);
  }
}