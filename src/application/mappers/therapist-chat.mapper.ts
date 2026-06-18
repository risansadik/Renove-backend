import type { TherapistChatThreadEntity } from "../../domain/entities/TherapistChatThread.entity.ts";
import type { TherapistChatMessageEntity } from "../../domain/entities/TherapistChatMessage.entity.ts";

export interface PublicTherapistChatThreadDTO {
  id?: string;
  userId: string | { id: string; name: string; email: string };
  therapistId: string | { id: string; name: string };
  expiresAt: Date;
  lastBookingId: string;
  isActive: boolean;
  unreadCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PublicTherapistChatMessageDTO {
  id?: string;
  threadId: string;
  senderId: string;
  senderRole: "user" | "therapist";
  content: string;
  isRead: boolean;
  createdAt?: Date;
}

export class TherapistChatMapper {
  static toThreadDTO(thread: TherapistChatThreadEntity & {unreadCount ?: number}): PublicTherapistChatThreadDTO {
    return {
      id: thread.id,
      userId: thread.userId,
      therapistId: thread.therapistId,
      expiresAt: thread.expiresAt,
      lastBookingId: thread.lastBookingId,
      isActive: thread.expiresAt > new Date(),
      unreadCount: thread.unreadCount ?? 0,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
    };
  }

  static toThreadDTOList(threads: (TherapistChatThreadEntity & {unreadCount?: number})[]): PublicTherapistChatThreadDTO[] {
    return threads.map((t) => this.toThreadDTO(t));
  }

  static toMessageDTO(message: TherapistChatMessageEntity): PublicTherapistChatMessageDTO {
    return {
      id: message.id,
      threadId: message.threadId,
      senderId: message.senderId,
      senderRole: message.senderRole,
      content: message.content,
      isRead: message.isRead,
      createdAt: message.createdAt,
    };
  }

  static toMessageDTOList(messages: TherapistChatMessageEntity[]): PublicTherapistChatMessageDTO[] {
    return messages.map((m) => this.toMessageDTO(m));
  }
}