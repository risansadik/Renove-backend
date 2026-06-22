import { TherapistChatSenderRole } from "../../shared/constants/index";

export interface TherapistChatMessageEntity {
  id?: string;
  threadId: string;
  senderId: string;
  senderRole: TherapistChatSenderRole;
  content: string;
  isRead: boolean;
  createdAt?: Date;
}