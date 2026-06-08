import type { ChatMessageEntity } from "../entities/ChatMessage.entity.ts";
import type { ChatSessionEntity } from "../entities/ChatSession.entity.ts";

export interface IChatMessageRepository {
  // Sessions
  createSession(userId: string, title: string): Promise<ChatSessionEntity>;
  getSessions(userId: string): Promise<ChatSessionEntity[]>;
  deleteSession(userId: string, sessionId: string): Promise<void>;

  // Messages
  saveMessage(message: Omit<ChatMessageEntity, "id" | "createdAt">): Promise<ChatMessageEntity>;
  getSessionMessages(userId: string, sessionId: string, limit?: number): Promise<ChatMessageEntity[]>;
}