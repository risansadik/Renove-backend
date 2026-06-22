import type { Response } from "express";
import { injectable, inject } from "inversify";
import { ResponseModel } from "../../shared/utils/response-model";
import type { AuthRequest } from "../../shared/types/express";
import { MESSAGES } from "../../shared/constants/index";
import { TYPES } from "../../shared/constants/tokens";
import { type ICompleteSessionUseCase, type ICreatePaymentIntentUseCase, type IHandleStripeWebhookUseCase, type IVerifyPaymentUseCase } from "../../application/interfaces/payment/IPaymentUseCase";

@injectable()
export class PaymentController {
  constructor(
    @inject(TYPES.CreatePaymentIntentUseCase) private readonly _createIntentUC: ICreatePaymentIntentUseCase,
    @inject(TYPES.HandleStripeWebhookUseCase) private readonly _handleWebhookUC: IHandleStripeWebhookUseCase,
    @inject(TYPES.CompleteSessionUseCase) private readonly _completeSessionUC: ICompleteSessionUseCase,
    @inject(TYPES.VerifyPaymentUseCase) private readonly _verifyPaymentUC: IVerifyPaymentUseCase
  ) { }

  public createIntent = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { bookingId } = req.body;

    const result = await this._createIntentUC.execute({ bookingId, userId });

    res.json(ResponseModel.success(MESSAGES.PAYMENT.INTENT_CREATED, result));
  };


  public completeSession = async (req: AuthRequest, res: Response): Promise<void> => {
    const therapistId = req.user!.id;
    const { bookingId } = req.params;

    const result = await this._completeSessionUC.execute({ bookingId, therapistId });

    res.json(ResponseModel.success(MESSAGES.PAYMENT.SESSION_COMPLETED, result));
  };

  public handleWebhook = async (req: AuthRequest, res: Response): Promise<void> => {
    const signature = req.headers["stripe-signature"] as string;
    const rawBody = req.body;

    await this._handleWebhookUC.execute({ signature, rawBody });

    res.status(200).json({ received: true });
  };

  public verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { bookingId } = req.body;
    const result = await this._verifyPaymentUC.execute({ bookingId, userId });
    res.json(ResponseModel.success(MESSAGES.PAYMENT.VERIFIED, result));
  };
}
