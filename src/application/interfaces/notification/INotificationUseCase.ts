import type { IUseCase } from "../IUseCase";
import type { NotificationEntity, NotificationRecipientRole } from "../../../domain/entities/Notification.entity";

export interface IGetNotificationsInput {
  recipientId: string;
  role: NotificationRecipientRole;
}

export interface IMarkReadInput {
  notificationId: string;
  recipientId: string;
}

export interface IMarkAllReadInput {
  recipientId: string;
  role: NotificationRecipientRole;
}

export type IGetNotificationsUseCase = IUseCase<IGetNotificationsInput, NotificationEntity[]>;
export type IMarkNotificationReadUseCase = IUseCase<IMarkReadInput, void>;
export type IMarkAllNotificationsReadUseCase = IUseCase<IMarkAllReadInput, void>;