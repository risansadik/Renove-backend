import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import type { INotificationRepository } from "../../../domain/repositories/notification.repository.ts";
import type { NotificationEntity } from "../../../domain/entities/Notification.entity.ts";
import type {
  IGetNotificationsUseCase,
  IGetNotificationsInput,
  IMarkNotificationReadUseCase,
  IMarkReadInput,
  IMarkAllNotificationsReadUseCase,
  IMarkAllReadInput,
} from "../../interfaces/notification/INotificationUseCase.ts";

@injectable()
export class GetNotificationsUseCase implements IGetNotificationsUseCase {
  constructor(
    @inject(TYPES.NotificationRepository)
    private readonly _notificationRepo: INotificationRepository
  ) {}

  async execute(input: IGetNotificationsInput): Promise<NotificationEntity[]> {
    return this._notificationRepo.findByRecipient(input.recipientId, input.role);
  }
}

@injectable()
export class MarkNotificationReadUseCase implements IMarkNotificationReadUseCase {
  constructor(
    @inject(TYPES.NotificationRepository)
    private readonly _notificationRepo: INotificationRepository
  ) {}

  async execute(input: IMarkReadInput): Promise<void> {
    await this._notificationRepo.markAsRead(input.notificationId, input.recipientId);
  }
}

@injectable()
export class MarkAllNotificationsReadUseCase implements IMarkAllNotificationsReadUseCase {
  constructor(
    @inject(TYPES.NotificationRepository)
    private readonly _notificationRepo: INotificationRepository
  ) {}

  async execute(input: IMarkAllReadInput): Promise<void> {
    await this._notificationRepo.markAllAsRead(input.recipientId, input.role);
  }
}