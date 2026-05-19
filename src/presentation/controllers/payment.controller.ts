import type { Request, Response, NextFunction } from "express";
import { CreatePaymentIntentUseCase } from "../../application/use-cases/payment/create-payment-intent.usecase.js";
import { HandleStripeWebhookUseCase } from "../../application/use-cases/payment/handle-stripe-webhook.usecase.js";
import { CompleteSessionUseCase } from "../../application/use-cases/payment/complete-session.usecase.js";
import { StripeHelper } from "../../shared/utils/stripe.js";
import { ResponseModel } from "../../shared/utils/response-model.js";
import { logger } from "../../shared/utils/logger.js";
import type { AuthenticatedRequest } from "../../shared/types/express.js";
import { VerifyPaymentUseCase } from "../../application/use-cases/payment/verify-payment.usecase.js";

export class PaymentController {
  constructor(
    private _createIntentUC: CreatePaymentIntentUseCase,
    private _handleWebhookUC: HandleStripeWebhookUseCase,
    private _completeSessionUC: CompleteSessionUseCase,
    private _verifyPaymentUC: VerifyPaymentUseCase,
  ) { }

  /**
   * Creates a Stripe Payment Intent for a specific booking.
   */
  async createIntent(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { bookingId } = req.body;

      const result = await this._createIntentUC.execute(bookingId, userId);

      res.json(ResponseModel.success("Payment intent created successfully", result));
    } catch (err) {
      next(err);
    }
  }

  /**
   * Handles session completion by therapist.
   */
  async completeSession(req: Request, res: Response, next: NextFunction) {
    try {
      const therapistId = (req as AuthenticatedRequest).user.id;
      const { bookingId } = req.params;

      const result = await this._completeSessionUC.execute(bookingId, therapistId);

      res.json(ResponseModel.success("Session completed and funds moved", result));
    } catch (err) {
      next(err);
    }
  }

  /**
   * Stripe Webhook Handler (Requires raw body for signature verification).
   */
  async handleWebhook(req: Request, res: Response, _next: NextFunction) {
    try {
      const signature = req.headers["stripe-signature"] as string;
      // Note: req.body must be the raw buffer here, handled by specialized middleware or config
      const event = StripeHelper.verifyWebhook(req.body, signature);

      await this._handleWebhookUC.execute(event);

      // Stripe requires a 200 response to acknowledge receipt
      res.status(200).json({ received: true });
    } catch (err: any) {
      logger.error("Webhook Error", { message: err.message });
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { bookingId } = req.body;
      const result = await this._verifyPaymentUC.execute(bookingId, userId);
      res.json(ResponseModel.success("Payment verified", result));
    } catch (err) {
      next(err);
    }
  }
}
