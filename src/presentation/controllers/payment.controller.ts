import type { Request, Response } from "express";
import { injectable, inject } from "inversify";
import type { CreatePaymentIntentUseCase } from "../../application/use-cases/payment/create-payment-intent.usecase.ts";
import type { HandleStripeWebhookUseCase } from "../../application/use-cases/payment/handle-stripe-webhook.usecase.ts";
import type { CompleteSessionUseCase } from "../../application/use-cases/payment/complete-session.usecase.ts";
import { StripeHelper } from "../../shared/utils/stripe.ts";
import { ResponseModel } from "../../shared/utils/response-model.ts";
import type { AuthenticatedRequest } from "../../shared/types/express.ts";
import type { VerifyPaymentUseCase } from "../../application/use-cases/payment/verify-payment.usecase.ts";
import { MESSAGES } from "../../shared/constants/index.ts";
import { TYPES } from "../../shared/constants/tokens.ts";

@injectable()
export class PaymentController {
  constructor(
    @inject(TYPES.CreatePaymentIntentUseCase) private readonly _createIntentUC: CreatePaymentIntentUseCase,
    @inject(TYPES.HandleStripeWebhookUseCase) private readonly _handleWebhookUC: HandleStripeWebhookUseCase,
    @inject(TYPES.CompleteSessionUseCase) private readonly _completeSessionUC: CompleteSessionUseCase,
    @inject(TYPES.VerifyPaymentUseCase) private readonly _verifyPaymentUC: VerifyPaymentUseCase
  ) { }

  /**
   * Creates a Stripe Payment Intent for a specific booking.
   */
  public createIntent = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthenticatedRequest).user.id;
    const { bookingId } = req.body;

    const result = await this._createIntentUC.execute(bookingId, userId);

    res.json(ResponseModel.success(MESSAGES.PAYMENT.INTENT_CREATED, result));
  };

  /**
   * Handles session completion by therapist.
   */
  public completeSession = async (req: Request, res: Response): Promise<void> => {
    const therapistId = (req as AuthenticatedRequest).user.id;
    const { bookingId } = req.params;

    const result = await this._completeSessionUC.execute(bookingId, therapistId);

    res.json(ResponseModel.success(MESSAGES.PAYMENT.SESSION_COMPLETED, result));
  };

  /**
   * Stripe Webhook Handler (Requires raw body for signature verification).
   */
  public handleWebhook = async (req: Request, res: Response): Promise<void> => {
    const signature = req.headers["stripe-signature"] as string;
    // Note: req.body must be the raw buffer here, handled by specialized middleware or config
    const event = StripeHelper.verifyWebhook(req.body, signature);

    await this._handleWebhookUC.execute(event);

    // Stripe requires a 200 response to acknowledge receipt
    res.status(200).json({ received: true });
  };

  public verifyPayment = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthenticatedRequest).user.id;
    const { bookingId } = req.body;
    const result = await this._verifyPaymentUC.execute(bookingId, userId);
    res.json(ResponseModel.success(MESSAGES.PAYMENT.VERIFIED, result));
  };
}
