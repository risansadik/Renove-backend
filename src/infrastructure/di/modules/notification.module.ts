import type { Container } from "inversify";
import { TYPES } from "../../../shared/constants/tokens";
import { NotificationRepository } from "../../repositories/notification.repository.impl";
import type { INotificationRepository } from "../../../domain/repositories/notification.repository";
import {
  GetNotificationsUseCase,
  MarkNotificationReadUseCase,
  MarkAllNotificationsReadUseCase,
} from "../../../application/use-cases/notification/notification.usecase";
import type {
  IGetNotificationsUseCase,
  IMarkNotificationReadUseCase,
  IMarkAllNotificationsReadUseCase,
} from "../../../application/interfaces/notification/INotificationUseCase";
import { NotificationService } from "../../external-services/notification.service";
import type { INotificationService } from "../../../application/interfaces/services/INotificationService";
import { NotificationController } from "../../../presentation/controllers/notification.controller";

export const registerNotificationModule = (container: Container): void => {
  container
    .bind<INotificationRepository>(TYPES.NotificationRepository)
    .to(NotificationRepository)
    .inSingletonScope();

  container
    .bind<INotificationService>(TYPES.NotificationService)
    .to(NotificationService)
    .inSingletonScope();

  container
    .bind<IGetNotificationsUseCase>(TYPES.GetNotificationsUseCase)
    .to(GetNotificationsUseCase);

  container
    .bind<IMarkNotificationReadUseCase>(TYPES.MarkNotificationReadUseCase)
    .to(MarkNotificationReadUseCase);

  container
    .bind<IMarkAllNotificationsReadUseCase>(TYPES.MarkAllNotificationsReadUseCase)
    .to(MarkAllNotificationsReadUseCase);

  container
    .bind<NotificationController>(TYPES.NotificationController)
    .to(NotificationController)
    .inSingletonScope();
};