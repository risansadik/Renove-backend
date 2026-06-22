import express, { Router } from "express";
import { appContainer } from "../../infrastructure/di/container";
import { PaymentController } from "../controllers/payment.controller";
import { authenticate, authorize } from "../../infrastructure/di/middlewares";
import { ROLES } from "../../shared/constants/index";
import { TYPES } from "../../shared/constants/tokens";
import { asyncHandler } from "../middlewares/async-handler.middleware";

const router = Router();
const paymentController = appContainer.get<PaymentController>(TYPES.PaymentController);


router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  asyncHandler(paymentController.handleWebhook)
);

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
