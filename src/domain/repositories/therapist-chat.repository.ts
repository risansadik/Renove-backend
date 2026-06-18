import type { TherapistChatThreadEntity } from "../entities/TherapistChatThread.entity.ts";
import type { TherapistChatMessageEntity } from "../entities/TherapistChatMessage.entity.ts";
import { PaginationParams, PaginatedResult } from "../interfaces/pagination.ts";

export interface ITherapistChatRepository {
  // Thread operations
  findThreadById(id: string): Promise<TherapistChatThreadEntity | null>;
  findThreadByUserAndTherapist(userId: string, therapistId: string): Promise<TherapistChatThreadEntity | null>;
  upsertThreadExpiry(input: { userId: string; therapistId: string; bookingId: string; expiresAt: Date }): Promise<TherapistChatThreadEntity>;
  findThreadsByUserId(userId: string, params?: PaginationParams): Promise<PaginatedResult<TherapistChatThreadEntity>>;
  findThreadsByTherapistId(therapistId: string, params?: PaginationParams): Promise<PaginatedResult<TherapistChatThreadEntity>>;

  // Message operations
  createMessage(message: Omit<TherapistChatMessageEntity, "id" | "createdAt">): Promise<TherapistChatMessageEntity>;
  findMessagesByThreadId(threadId: string, params?: PaginationParams): Promise<PaginatedResult<TherapistChatMessageEntity>>;
  markMessagesAsRead(threadId: string, readerRole: TherapistChatMessageEntity["senderRole"]): Promise<void>;
  countUnreadMessages(threadId: string, readerRole: TherapistChatMessageEntity["senderRole"]): Promise<number>;
}