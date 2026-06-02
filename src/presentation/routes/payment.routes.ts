import express, { Router } from "express";
import { appContainer } from "../../infrastructure/di/container.ts";
import { PaymentController } from "../controllers/payment.controller.ts";
import { authenticate, authorize } from "../../infrastructure/di/middlewares.ts";
import { ROLES } from "../../shared/constants/index.ts";
import { TYPES } from "../../shared/constants/tokens.ts";
import { asyncHandler } from "../middlewares/async-handler.middleware.ts";

const router = Router();
const paymentController = appContainer.get<PaymentController>(TYPES.PaymentController);


/**
 * PUBLIC ROUTES (Webhooks must be public and handle raw body)
 */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  asyncHandler(paymentController.handleWebhook)
);

/**
 * PROTECTED ROUTES
 */
router.post(
  "/create-intent",
  authenticate,
  authorize(ROLES.USER),
  asyncHandler(paymentController.createIntent)
);

router.post(
  "/:bookingId/complete",
  authenticate,
  authorize(ROLES.THERAPIST),
  asyncHandler(paymentController.completeSession)
);

router.post(
  "/verify-payment",
  authenticate,
  authorize(ROLES.USER),
  asyncHandler(paymentController.verifyPayment)
);

export default router;
