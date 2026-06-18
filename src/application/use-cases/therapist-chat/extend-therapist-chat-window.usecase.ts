import { inject, injectable } from "inversify";
import { ExtendTherapistChatWindowInput, IExtendTherapistChatWindowUseCase } from "../../interfaces/therapist-chat/ITherapistChatUseCase.ts";
import { TYPES } from "../../../shared/constants/tokens.ts";
import { ITherapistChatRepository } from "../../../domain/repositories/therapist-chat.repository.ts";
import { TherapistChatThreadEntity } from "../../../domain/entities/TherapistChatThread.entity.ts";
import { CHAT_WINDOW_DAYS, MS_IN_DAY } from "../../../shared/constants/index.ts";

@injectable()
export class ExtendTherapistChatWindowUseCase implements IExtendTherapistChatWindowUseCase {
  constructor(
    @inject(TYPES.TherapistChatRepository)
    private readonly _chatRepo: ITherapistChatRepository
  ) {}

  async execute(input: ExtendTherapistChatWindowInput): Promise<TherapistChatThreadEntity> {
    const expiresAt = new Date(Date.now() + CHAT_WINDOW_DAYS * MS_IN_DAY);

    return this._chatRepo.upsertThreadExpiry({
      userId: input.userId,
      therapistId: input.therapistId,
      bookingId: input.bookingId,
      expiresAt,
    });
  }
}