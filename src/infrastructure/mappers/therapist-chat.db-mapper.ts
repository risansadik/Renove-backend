import type { ITherapistChatThreadRaw } from "../databases/schema/therapist-chat-thread.schema.ts";
import type { ITherapistChatMessageRaw } from "../databases/schema/therapist-chat-message.schema.ts";
import type { TherapistChatThreadEntity } from "../../domain/entities/TherapistChatThread.entity.ts";
import type { TherapistChatMessageEntity } from "../../domain/entities/TherapistChatMessage.entity.ts";

export class TherapistChatDbMapper {
  static toThreadEntity(doc: ITherapistChatThreadRaw): TherapistChatThreadEntity {
    return {
      id: doc._id.toString(),
      userId:
        typeof doc.userId === "object" && doc.userId && "name" in doc.userId
          ? {
              id: doc.userId._id.toString(),
              name: (doc.userId as { _id: { toString(): string }; name: string; email: string }).name,
              email: (doc.userId as { _id: { toString(): string }; name: string; email: string }).email,
            }
          : (doc.userId as { toString(): string }).toString(),
      therapistId:
        typeof doc.therapistId === "object" && doc.therapistId && "name" in doc.therapistId
          ? {
              id: doc.therapistId._id.toString(),
              name: (doc.therapistId as { _id: { toString(): string }; name: string }).name,
            }
          : (doc.therapistId as { toString(): string }).toString(),
      expiresAt: doc.expiresAt,
      lastBookingId: doc.lastBookingId.toString(),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  static toMessageEntity(doc: ITherapistChatMessageRaw): TherapistChatMessageEntity {
    return {
      id: doc._id.toString(),
      threadId: doc.threadId.toString(),
      senderId: doc.senderId.toString(),
      senderRole: doc.senderRole,
      content: doc.content,
      isRead: doc.isRead,
      createdAt: doc.createdAt,
    };
  }
}