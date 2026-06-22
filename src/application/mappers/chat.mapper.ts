import type { ChatSessionEntity } from "../../domain/entities/ChatSession.entity";
import type { ChatMessageEntity } from "../../domain/entities/ChatMessage.entity";
import type { ChatRole } from "../../shared/constants/index";

export interface PublicChatSessionDTO {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
}

export interface PublicChatMessageDTO {
  id?: string;
  userId?: string;
  sessionId?: string;
  role: ChatRole;
  content: string;
  createdAt: Date;
}

export class ChatMapper {
  static toSessionDTO(entity: ChatSessionEntity): PublicChatSessionDTO {
    return {
      id: entity.id,
      userId: entity.userId,
      title: entity.title,
      createdAt: entity.createdAt,
    };
  }

  static toSessionDTOList(entities: ChatSessionEntity[]): PublicChatSessionDTO[] {
    return entities.map(e => this.toSessionDTO(e));
  }

  static toMessageDTO(entity: Partial<ChatMessageEntity>): PublicChatMessageDTO {
    return {
      id: entity.id,
      userId: entity.userId,
      sessionId: entity.sessionId,
      role: entity.role!,
      content: entity.content!,
      createdAt: entity.createdAt!,
    };
  }

  static toMessageDTOList(entities: Partial<ChatMessageEntity>[]): PublicChatMessageDTO[] {
    return entities.map(e => this.toMessageDTO(e));
  }
}
