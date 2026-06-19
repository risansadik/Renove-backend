import { injectable, inject } from "inversify";
import { TYPES } from "../../shared/constants/tokens.ts";
import { ICreateNotificationInput, INotificationService } from "../../application/interfaces/services/INotificationService.ts";
import { INotificationRepository } from "../../domain/repositories/notification.repository.ts";
import { SocketServer } from "../socket/socket.server.ts";
import { NotificationEntity } from "../../domain/entities/Notification.entity.ts";

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