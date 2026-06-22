import { inject, injectable } from "inversify";
import { IMarkTherapistChatAsReadUseCase, MarkTherapistChatAsReadInput } from "../../interfaces/therapist-chat/ITherapistChatUseCase";
import { TYPES } from "../../../shared/constants/tokens";
import type { ITherapistChatRepository } from "../../../domain/repositories/therapist-chat.repository";
import { AppError } from "../../../shared/utils/AppError";
import { HttpStatus } from "../../../shared/constants/index";

@injectable()
export class MarkTherapistChatAsReadUseCase implements IMarkTherapistChatAsReadUseCase {
  constructor(
    @inject(TYPES.TherapistChatRepository)
    private readonly _chatRepo: ITherapistChatRepository
  ) {}

  async execute(input: MarkTherapistChatAsReadInput): Promise<void> {
    const thread = await this._chatRepo.findThreadById(input.threadId);

    if (!thread) {
      throw new AppError("Chat thread not found", HttpStatus.NOT_FOUND);
    }

    const userId =
      typeof thread.userId === "object" ? thread.userId.id : thread.userId;
    const therapistId =
      typeof thread.therapistId === "object" ? thread.therapistId.id : thread.therapistId;

    const isParticipant =
      (input.readerRole === "user" && input.requesterId === userId) ||
      (input.readerRole === "therapist" && input.requesterId === therapistId);

    if (!isParticipant) {
      throw new AppError("Access denied", HttpStatus.FORBIDDEN);
    }

    await this._chatRepo.markMessagesAsRead(input.threadId, input.readerRole);
  }
}