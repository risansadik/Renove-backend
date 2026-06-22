import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/constants/tokens";
import { GetTherapistChatMessagesInput, IGetTherapistChatMessagesUseCase } from "../../interfaces/therapist-chat/ITherapistChatUseCase";
import type { ITherapistChatRepository } from "../../../domain/repositories/therapist-chat.repository";
import { PaginatedResult } from "../../../domain/interfaces/pagination";
import { TherapistChatMessageEntity } from "../../../domain/entities/TherapistChatMessage.entity";
import { HttpStatus } from "../../../shared/constants/index";
import { AppError } from "../../../shared/utils/AppError";

@injectable()
export class GetTherapistChatMessagesUseCase implements IGetTherapistChatMessagesUseCase {
  constructor(
    @inject(TYPES.TherapistChatRepository)
    private readonly _chatRepo: ITherapistChatRepository
  ) {}

  async execute(input: GetTherapistChatMessagesInput): Promise<PaginatedResult<TherapistChatMessageEntity>> {
    const thread = await this._chatRepo.findThreadById(input.threadId);

    if (!thread) {
      throw new AppError("Chat thread not found", HttpStatus.NOT_FOUND);
    }

    const userId =
      typeof thread.userId === "object" ? thread.userId.id : thread.userId;
    const therapistId =
      typeof thread.therapistId === "object" ? thread.therapistId.id : thread.therapistId;

    const isParticipant =
      (input.requesterRole === "user" && input.requesterId === userId) ||
      (input.requesterRole === "therapist" && input.requesterId === therapistId);

    if (!isParticipant) {
      throw new AppError("Access denied", HttpStatus.FORBIDDEN);
    }

    return this._chatRepo.findMessagesByThreadId(input.threadId, input.params);
  }
}