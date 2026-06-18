import { inject, injectable } from "inversify";
import { ISendTherapistChatMessageUseCase, SendTherapistChatMessageInput } from "../../interfaces/therapist-chat/ITherapistChatUseCase.ts";
import { TYPES } from "../../../shared/constants/tokens.ts";
import { ITherapistChatRepository } from "../../../domain/repositories/therapist-chat.repository.ts";
import { TherapistChatMessageEntity } from "../../../domain/entities/TherapistChatMessage.entity.ts";
import { HttpStatus } from "../../../shared/constants/index.ts";
import { AppError } from "../../../shared/utils/AppError.ts";

@injectable()
export class SendTherapistChatMessageUseCase implements ISendTherapistChatMessageUseCase {
  constructor(
    @inject(TYPES.TherapistChatRepository)
    private readonly _chatRepo: ITherapistChatRepository
  ) {}

  async execute(input: SendTherapistChatMessageInput): Promise<TherapistChatMessageEntity> {
    const thread = await this._chatRepo.findThreadById(input.threadId);

    if (!thread) {
      throw new AppError("Chat thread not found", HttpStatus.NOT_FOUND);
    }

    const userId =
      typeof thread.userId === "object" ? thread.userId.id : thread.userId;
    const therapistId =
      typeof thread.therapistId === "object" ? thread.therapistId.id : thread.therapistId;

    const isParticipant =
      (input.senderRole === "user" && input.senderId === userId) ||
      (input.senderRole === "therapist" && input.senderId === therapistId);

    if (!isParticipant) {
      throw new AppError("Access denied", HttpStatus.FORBIDDEN);
    }

    if (thread.expiresAt <= new Date()) {
      throw new AppError(
        "Chat window has expired. Please book a new session to continue messaging.",
        HttpStatus.GONE
      );
    }

    return this._chatRepo.createMessage({
      threadId: input.threadId,
      senderId: input.senderId,
      senderRole: input.senderRole,
      content: input.content,
      isRead: false,
    });
  }
}