import type { INotificationDocument } from "../databases/schema/notification.schema";
import type { NotificationEntity } from "../../domain/entities/Notification.entity";

export class NotificationDbMapper {
  static toEntity(doc: INotificationDocument): NotificationEntity {
    const obj = doc.toObject({ versionKey: false }) as Record<string, unknown>;
    if (obj._id) {
      obj.id = String(obj._id);
      delete obj._id;
    }
    if (obj.recipientId) obj.recipientId = String(obj.recipientId);
    if (obj.bookingId) obj.bookingId = String(obj.bookingId);
    return obj as unknown as NotificationEntity;
  }
}