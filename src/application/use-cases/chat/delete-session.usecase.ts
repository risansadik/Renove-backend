import { inject, injectable } from "inversify";
import { IDeleteSessionUseCase } from "../../interfaces/chat/IChatUseCase.ts";
import { TYPES } from "../../../shared/constants/tokens.ts";
import { IChatMessageRepository } from "../../../domain/repositories/chat-message.repository.ts";

@injectable()
export class DeleteSessionUseCase implements IDeleteSessionUseCase {
  constructor(
    @inject(TYPES.ChatMessageRepository) private readonly _chatRepo: IChatMessageRepository
  ) {}

  async execute({ userId, sessionId }: { userId: string; sessionId: string }): Promise<void> {
    return this._chatRepo.deleteSession(userId, sessionId);
  }
}