import express, { Router } from "express";
import { PaymentController } from "../controllers/payment.controller.js";
import { CreatePaymentIntentUseCase } from "../../application/use-cases/payment/create-payment-intent.usecase.js";
import { HandleStripeWebhookUseCase } from "../../application/use-cases/payment/handle-stripe-webhook.usecase.js";
import { CompleteSessionUseCase } from "../../application/use-cases/payment/complete-session.usecase.js";
import { PaymentRepositoryImpl } from "../../infrastructure/repositories/payment.repository.impl.js";
import { BookingRepositoryImpl } from "../../infrastructure/repositories/booking.repository.impl.js";
import { TherapistRepository } from "../../infrastructure/repositories/therapist.repository.impl.js";
import { WalletRepositoryImpl } from "../../infrastructure/repositories/wallet.repository.impl.js";
import { SlotRepository } from "../../infrastructure/repositories/availability.repository.impl.js";
import { SettingsRepositoryImpl } from "../../infrastructure/repositories/settings.repository.impl.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { ROLES } from "../../shared/constants/index.js";
import { VerifyPaymentUseCase } from "../../application/use-cases/payment/verify-payment.usecase.js";

const router = Router();

// Infrastructure
const paymentRepo = new PaymentRepositoryImpl();
const bookingRepo = new BookingRepositoryImpl();
const therapistRepo = new TherapistRepository();
const walletRepo = new WalletRepositoryImpl();
const slotRepo = new SlotRepository();
const settingsRepo = new SettingsRepositoryImpl();

// Use Cases
const createIntentUC = new CreatePaymentIntentUseCase(paymentRepo, bookingRepo, therapistRepo, settingsRepo);
const handleWebhookUC = new HandleStripeWebhookUseCase(paymentRepo, bookingRepo, walletRepo, slotRepo);
const completeSessionUC = new CompleteSessionUseCase(bookingRepo, walletRepo, paymentRepo);
const verifyPaymentUC = new VerifyPaymentUseCase(paymentRepo, bookingRepo, walletRepo, slotRepo);


const paymentController = new PaymentController(createIntentUC, handleWebhookUC, completeSessionUC, verifyPaymentUC);


/**
 * PUBLIC ROUTES (Webhooks must be public and handle raw body)
 */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, res, next) => paymentController.handleWebhook(req, res, next)
);

/**
 * PROTECTED ROUTES
 */
router.post(
  "/create-intent",
  authenticate,
  authorize(ROLES.USER),
  (req, res, next) => paymentController.createIntent(req, res, next)
);

router.post(
  "/:bookingId/complete",
  authenticate,
  authorize(ROLES.THERAPIST),
  (req, res, next) => paymentController.completeSession(req, res, next)
);

router.post(
  "/verify-payment",
  authenticate,
  authorize(ROLES.USER),
  (req, res, next) => paymentController.verifyPayment(req, res, next)
);

export default router;
