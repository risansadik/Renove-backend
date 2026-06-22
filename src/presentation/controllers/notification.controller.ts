import {  Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../shared/constants/tokens";
import { ResponseModel } from "../../shared/utils/response-model";
import type { IGetNotificationsUseCase } from "../../application/interfaces/notification/INotificationUseCase";
import type { IMarkNotificationReadUseCase } from "../../application/interfaces/notification/INotificationUseCase";
import type { IMarkAllNotificationsReadUseCase } from "../../application/interfaces/notification/INotificationUseCase";
import type { NotificationRecipientRole } from "../../domain/entities/Notification.entity";
import { AuthenticatedRequest } from "../../shared/types/express";

@injectable()
export class NotificationController {
  constructor(
    @inject(TYPES.GetNotificationsUseCase)
    private readonly _getNotificationsUC: IGetNotificationsUseCase,
    @inject(TYPES.MarkNotificationReadUseCase)
    private readonly _markReadUC: IMarkNotificationReadUseCase,
    @inject(TYPES.MarkAllNotificationsReadUseCase)
    private readonly _markAllReadUC: IMarkAllNotificationsReadUseCase
  ) {}

  public getNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const role = req.user!.role as NotificationRecipientRole;
    const notifications = await this._getNotificationsUC.execute({
      recipientId: userId,
      role,
    });
    res.json(ResponseModel.success("Notifications fetched", notifications));
  };

  public markAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { notificationId } = req.params;
    await this._markReadUC.execute({ notificationId, recipientId: userId });
    res.json(ResponseModel.success("Notification marked as read", null));
  };

  public markAllAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const role = req.user!.role as NotificationRecipientRole;
    await this._markAllReadUC.execute({ recipientId: userId, role });
    res.json(ResponseModel.success("All notifications marked as read", null));
  };
}