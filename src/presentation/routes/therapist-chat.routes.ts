import { Router } from "express";
import { appContainer } from "../../infrastructure/di/container.ts";
import { TherapistChatController } from "../controllers/therapist-chat.controller.ts";
import { authenticate } from "../../infrastructure/di/middlewares.ts";
import { TYPES } from "../../shared/constants/tokens.ts";
import { asyncHandler } from "../middlewares/async-handler.middleware.ts";

const router = Router();
const therapistChatController = appContainer.get<TherapistChatController>(
  TYPES.TherapistChatController
);

// Both user and therapist can list their own threads
router.get("/threads", authenticate, asyncHandler(therapistChatController.getThreads));

// Both user and therapist can read messages in a thread they belong to
router.get(
  "/threads/:threadId/messages",
  authenticate,
  asyncHandler(therapistChatController.getMessages)
);

// Both user and therapist can send messages (use case guards expiry + participant check)
router.post(
  "/threads/:threadId/messages",
  authenticate,
  asyncHandler(therapistChatController.sendMessage)
);

// Mark messages in a thread as read
router.patch(
  "/threads/:threadId/read",
  authenticate,
  asyncHandler(therapistChatController.markAsRead)
);

export default router;