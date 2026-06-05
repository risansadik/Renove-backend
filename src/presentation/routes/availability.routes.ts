import { Router } from "express";
import { appContainer } from "../../infrastructure/di/container.ts";
import { AvailabilityController } from "../controllers/availability.controller.ts";
import { authenticate } from "../../infrastructure/di/middlewares.ts";
import { TYPES } from "../../shared/constants/tokens.ts";
import { asyncHandler } from "../middlewares/async-handler.middleware.ts";

const router = Router();
const controller = appContainer.get<AvailabilityController>(TYPES.AvailabilityController);

// Routes
router.post("/", authenticate, asyncHandler(controller.createRule));
router.get("/my-rules", authenticate, asyncHandler(controller.getTherapistRules));
router.delete("/:id", authenticate, asyncHandler(controller.deleteRule));
router.get("/slots/:therapistId", asyncHandler(controller.getAvailableSlots));
router.post("/slots/:slotId/lock", authenticate, asyncHandler(controller.lockSlot));
router.post("/slots/:slotId/unlock", authenticate, asyncHandler(controller.unlockSlot));

export default router;
