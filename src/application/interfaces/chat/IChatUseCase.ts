// src/application/interfaces/chat/IChatUseCase.ts

import type { IUseCase } from "../IUseCase";
import type { ChatMessageEntity } from "../../../domain/entities/ChatMessage.entity";
import type { ChatSessionEntity } from "../../../domain/entities/ChatSession.entity";

export interface ISendMessageInput {
  userId: string;
  sessionId: string;
  message: string;
  onToken: (token: string) => void;
}

export type ISendMessageUseCase = IUseCase<ISendMessageInput, void>;

export type IGetSessionMessagesUseCase = IUseCase<
  { userId: string; sessionId: string },
  Pick<ChatMessageEntity, "role" | "content" | "createdAt">[]
>;

export type IGetSessionsUseCase = IUseCase<string, ChatSessionEntity[]>;

export type ICreateSessionUseCase = IUseCase<string, ChatSessionEntity>;

export type IDeleteSessionUseCase = IUseCase<
  { userId: string; sessionId: string },
  void
>;