import type { Types } from "mongoose";
import type { IChatSessionDocument, IChatMessageDocument } from "../databases/schema/chat-message.schema.ts";
import type { ChatSessionEntity } from "../../domain/entities/ChatSession.entity.ts";
import type { ChatMessageEntity } from "../../domain/entities/ChatMessage.entity.ts";

export class ChatDbMapper {
  static toSessionEntity(doc: IChatSessionDocument): ChatSessionEntity {
    return {
      id: (doc._id as Types.ObjectId).toString(),
      userId: doc.userId,
      title: doc.title,
      createdAt: doc.createdAt,
    };
  }

  static toMessageEntity(doc: IChatMessageDocument): ChatMessageEntity {
    return {
      id: (doc._id as Types.ObjectId).toString(),
      userId: doc.userId,
      sessionId: doc.sessionId,
      role: doc.role,
      content: doc.content,
      createdAt: doc.createdAt,
    };
  }
}
