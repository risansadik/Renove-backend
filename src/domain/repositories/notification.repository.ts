import type { NotificationEntity, NotificationRecipientRole } from "../entities/Notification.entity.ts";

export interface INotificationRepository {
  create(data: Omit<NotificationEntity, "id" | "createdAt" | "updatedAt">): Promise<NotificationEntity>;
  findByRecipient(recipientId: string, role: NotificationRecipientRole): Promise<NotificationEntity[]>;
  markAsRead(notificationId: string, recipientId: string): Promise<void>;
  markAllAsRead(recipientId: string, role: NotificationRecipientRole): Promise<void>;
  countUnread(recipientId: string, role: NotificationRecipientRole): Promise<number>;
}