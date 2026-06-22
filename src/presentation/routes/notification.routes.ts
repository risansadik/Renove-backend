import { Router } from "express";
import { appContainer } from "../../infrastructure/di/container";
import { TYPES } from "../../shared/constants/tokens";
import { NotificationController } from "../controllers/notification.controller";
import { authenticate } from "../../infrastructure/di/middlewares";
import { asyncHandler } from "../middlewares/async-handler.middleware";

const router = Router();

const notificationController = appContainer.get<NotificationController>(
  TYPES.NotificationController
);

router.get(
  "/",
  authenticate,
  asyncHandler(notificationController.getNotifications)
);

router.patch(
  "/:notificationId/read",
  authenticate,
  asyncHandler(notificationController.markAsRead)
);

router.patch(
  "/read-all",
  authenticate,
  asyncHandler(notificationController.markAllAsRead)
);

export default router;