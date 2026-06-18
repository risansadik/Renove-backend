import { inject, injectable } from "inversify";
import { GetTherapistChatThreadsInput, IGetTherapistChatThreadsUseCase } from "../../interfaces/therapist-chat/ITherapistChatUseCase.ts";
import { TYPES } from "../../../shared/constants/tokens.ts";
import { ITherapistChatRepository } from "../../../domain/repositories/therapist-chat.repository.ts";
import { PaginatedResult } from "../../../domain/interfaces/pagination.ts";
import { TherapistChatThreadEntity } from "../../../domain/entities/TherapistChatThread.entity.ts";

@injectable()
export class GetTherapistChatThreadsUseCase implements IGetTherapistChatThreadsUseCase {
  constructor(
    @inject(TYPES.TherapistChatRepository)
    private readonly _chatRepo: ITherapistChatRepository
  ) {}

  async execute(input: GetTherapistChatThreadsInput): Promise<PaginatedResult<TherapistChatThreadEntity & { unreadCount?: number }>> {
    let result: PaginatedResult<TherapistChatThreadEntity>;

    if (input.requesterRole === "user") {
      result = await this._chatRepo.findThreadsByUserId(input.requesterId, input.params);
    } else {
      result = await this._chatRepo.findThreadsByTherapistId(input.requesterId, input.params);
    }

    const enrichedData = await Promise.all(
      result.data.map(async (thread) => {
        const unreadCount = await this._chatRepo.countUnreadMessages(thread.id!, input.requesterRole);
        return {
          ...thread,
          unreadCount,
        };
      })
    );

    return {
      data: enrichedData,
      total: result.total,
    };
  }
}