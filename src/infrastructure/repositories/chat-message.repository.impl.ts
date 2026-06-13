import { injectable } from "inversify";
import type { IChatMessageRepository } from "../../domain/repositories/chat-message.repository.ts";
import type { ChatMessageEntity } from "../../domain/entities/ChatMessage.entity.ts";
import type { ChatSessionEntity } from "../../domain/entities/ChatSession.entity.ts";
import {
  ChatMessageModel,
  ChatSessionModel,
} from "../databases/schema/chat-message.schema.ts";
import { ChatDbMapper } from "../mappers/chat.db-mapper.ts";

@injectable()
export class ChatMessageRepository implements IChatMessageRepository {
  // ── Sessions ──────────

  async createSession(userId: string, title: string): Promise<ChatSessionEntity> {
    const doc = await ChatSessionModel.create({ userId, title });
    return ChatDbMapper.toSessionEntity(doc);
  }

  async getSessions(userId: string): Promise<ChatSessionEntity[]> {
    const docs = await ChatSessionModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
    return docs.map((d) => ChatDbMapper.toSessionEntity(d));
  }

  async deleteSession(userId: string, sessionId: string): Promise<void> {
    await ChatSessionModel.deleteOne({ _id: sessionId, userId }).exec();
    await ChatMessageModel.deleteMany({ sessionId, userId }).exec();
  }

  // ── Messages ────────

  async saveMessage(
    message: Omit<ChatMessageEntity, "id" | "createdAt">
  ): Promise<ChatMessageEntity> {
    const doc = await ChatMessageModel.create(message);
    return ChatDbMapper.toMessageEntity(doc);
  }

  async getSessionMessages(
    userId: string,
    sessionId: string,
    limit = 50
  ): Promise<ChatMessageEntity[]> {
    const docs = await ChatMessageModel
      .find({ userId, sessionId })
      .sort({ createdAt: 1 })
      .limit(limit)
      .exec();
    return docs.map((d) => ChatDbMapper.toMessageEntity(d));
  }
}