import { injectable, inject } from "inversify";
import { TYPES } from "../../shared/constants/tokens";
import { ICreateNotificationInput, INotificationService } from "../../application/interfaces/services/INotificationService";
import type { INotificationRepository } from "../../domain/repositories/notification.repository.js";
import { SocketServer } from "../socket/socket.server";
import { NotificationEntity } from "../../domain/entities/Notification.entity";

@injectable()
export class NotificationService implements INotificationService {
  constructor(
    @inject(TYPES.NotificationRepository)
    private readonly _notificationRepo: INotificationRepository,
    @inject(TYPES.SocketServer)
    private readonly _socketServer: SocketServer
  ) {}

  async createAndEmit(input: ICreateNotificationInput): Promise<NotificationEntity> {
    const notification = await this._notificationRepo.create({
      recipientId: input.recipientId,
      recipientRole: input.recipientRole,
      type: input.type,
      title: input.title,
      message: input.message,
      isRead: false,
      bookingId: input.bookingId,
    });

    this._socketServer.emitNotification(
      input.recipientId,
      input.recipientRole,
      notification
    );

    return notification;
  }
}