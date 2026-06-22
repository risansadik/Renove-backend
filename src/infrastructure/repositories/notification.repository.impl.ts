import { injectable } from "inversify";
import type {INotificationRepository } from "../../domain/repositories/notification.repository"
import type { NotificationEntity, NotificationRecipientRole } from "../../domain/entities/Notification.entity";
import { NotificationModel } from "../databases/schema/notification.schema";
import { NotificationDbMapper } from "../mappers/notification.db-mapper";

@injectable()
export class NotificationRepository implements INotificationRepository {
  async create(
    data: Omit<NotificationEntity, "id" | "createdAt" | "updatedAt">
  ): Promise<NotificationEntity> {
    const doc = await NotificationModel.create(data);
    return NotificationDbMapper.toEntity(doc);
  }

  async findByRecipient(
    recipientId: string,
    role: NotificationRecipientRole
  ): Promise<NotificationEntity[]> {
    const docs = await NotificationModel.find({ recipientId, recipientRole: role })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
    return docs.map(NotificationDbMapper.toEntity);
  }

  async markAsRead(notificationId: string, recipientId: string): Promise<void> {
    await NotificationModel.updateOne(
      { _id: notificationId, recipientId },
      { $set: { isRead: true } }
    ).exec();
  }

  async markAllAsRead(
    recipientId: string,
    role: NotificationRecipientRole
  ): Promise<void> {
    await NotificationModel.updateMany(
      { recipientId, recipientRole: role, isRead: false },
      { $set: { isRead: true } }
    ).exec();
  }

  async countUnread(
    recipientId: string,
    role: NotificationRecipientRole
  ): Promise<number> {
    return NotificationModel.countDocuments({
      recipientId,
      recipientRole: role,
      isRead: false,
    }).exec();
  }
}