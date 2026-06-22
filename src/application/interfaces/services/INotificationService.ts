import type { NotificationEntity } from "../../../domain/entities/Notification.entity";
import type { NotificationRecipientRole, NotificationType } from "../../../domain/entities/Notification.entity";

export interface ICreateNotificationInput {
  recipientId: string;
  recipientRole: NotificationRecipientRole;
  type: NotificationType;
  title: string;
  message: string;
  bookingId?: string;
}

export interface INotificationService {
  createAndEmit(input: ICreateNotificationInput): Promise<NotificationEntity>;
}