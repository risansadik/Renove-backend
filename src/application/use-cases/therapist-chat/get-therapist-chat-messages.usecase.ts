import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import { GetTherapistChatMessagesInput, IGetTherapistChatMessagesUseCase } from "../../interfaces/therapist-chat/ITherapistChatUseCase.ts";
import { ITherapistChatRepository } from "../../../domain/repositories/therapist-chat.repository.ts";
import { PaginatedResult } from "../../../domain/interfaces/pagination.ts";
import { TherapistChatMessageEntity } from "../../../domain/entities/TherapistChatMessage.entity.ts";
import { HttpStatus } from "../../../shared/constants/index.ts";
import { AppError } from "../../../shared/utils/AppError.ts";

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