import type { ChatRole } from "../../shared/constants/index";

export interface ChatMessageEntity {
  id: string;
  userId: string;
  sessionId: string;
  role: ChatRole;
  content: string;
  createdAt: Date;
}