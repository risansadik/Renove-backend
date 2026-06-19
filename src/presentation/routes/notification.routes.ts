import { Router } from "express";
import { appContainer } from "../../infrastructure/di/container.ts";
import { TYPES } from "../../shared/constants/tokens.ts";
import { NotificationController } from "../controllers/notification.controller.ts";
import { authenticate } from "../../infrastructure/di/middlewares.ts";
import { asyncHandler } from "../middlewares/async-handler.middleware.ts";

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