import type { IPaymentRepository } from "../../../domain/repositories/payment.repository.ts";
import type { IBookingRepository } from "../../../domain/repositories/booking.repository.ts";
import type { IWalletRepository } from "../../../domain/repositories/wallet.repository.ts";
import type { ISlotRepository } from "../../../domain/repositories/availability.repository.ts";
import { BOOKING_STATUS, PAYMENT_STATUS, SLOT_STATUS } from "../../../shared/constants/index.ts";
import Stripe from "stripe";
import { IHandleStripeWebhookInput, IHandleStripeWebhookUseCase } from "../../interfaces/payment/IPaymentUseCase.ts";
import { injectable,inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import { StripeHelper } from "../../../shared/utils/stripe.ts";
import { ILogger } from "../../interfaces/services/ILoggerService.ts";

@injectable()
export class HandleStripeWebhookUseCase implements IHandleStripeWebhookUseCase{
  constructor(
   @inject(TYPES.PaymentRepository) private _paymentRepo: IPaymentRepository,
   @inject(TYPES.BookingRepository) private _bookingRepo: IBookingRepository,
   @inject(TYPES.WalletRepository) private _walletRepo: IWalletRepository,
   @inject(TYPES.SlotRepository) private _slotRepo: ISlotRepository,
   @inject(TYPES.Logger) private readonly _logger: ILogger

  ) {}

  async execute({signature,rawBody} : IHandleStripeWebhookInput): Promise<void> {

    const event = StripeHelper.verifyWebhook(rawBody, signature);
    this._logger.info(`Processing Stripe Webhook Event: ${event.type}`, { eventId: event.id });

    switch (event.type) {
      case "payment_intent.succeeded":
        await this._handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case "payment_intent.payment_failed":
        await this._handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        this._logger.debug(`Unhandled Stripe event type: ${event.type}`);
    }
  }

  private async _handlePaymentSucceeded(intent: Stripe.PaymentIntent) {
    const payment = await this._paymentRepo.findByPaymentIntentId(intent.id);
    if (!payment) {
      this._logger.error("Payment record not found for successful intent", { intentId: intent.id });
      return;
    }

    // Idempotency check: if already paid, skip
    if (payment.status === PAYMENT_STATUS.PAID) {
      this._logger.info("Payment already processed as PAID", { paymentId: payment.id });
      return;
    }

    // 1. Update Payment Record
    await this._paymentRepo.updateStatus(payment.id!, PAYMENT_STATUS.PAID, {
      paidAt: new Date(),
    });

    // 2. Update Booking Status
    const booking = await this._bookingRepo.findById(payment.bookingId);
    if (booking) {
      await this._bookingRepo.updateStatus(payment.bookingId, BOOKING_STATUS.CONFIRMED);
      
      // 3. Update Slot Status to BOOKED
      const slotId = typeof booking.slotId === 'object' && booking.slotId !== null ? (booking.slotId as { id: string }).id : booking.slotId as string;
      await this._slotRepo.updateStatus(slotId, SLOT_STATUS.BOOKED);
    }

    // 4. Update Therapist Wallet: Add to Pending Balance
    const feeToCredit = payment.consultationFee ?? payment.amount;
    await this._walletRepo.addPendingBalance(payment.therapistId, feeToCredit);

    // 5. Create ledger transaction history
    const therapistWallet = await this._walletRepo.findByTherapistId(payment.therapistId);
    if (therapistWallet) {
      await this._walletRepo.createTransaction({
        walletId: therapistWallet.id!,
        walletType: "TherapistWallet",
        amount: feeToCredit,
        type: "credit",
        description: `Session payment pending (Booking: ${payment.bookingId})`,
        status: "pending",
        bookingId: payment.bookingId,
        consultationFee: payment.consultationFee ?? payment.amount,
        commissionPercentage: payment.commissionPercentage ?? 0,
        platformFee: payment.platformFee ?? 0,
        totalPaid: payment.amount,
        therapistEarnings: feeToCredit,
      });
    }

    this._logger.info("Successfully processed payment success webhook", { 
      paymentId: payment.id, 
      bookingId: payment.bookingId,
      therapistId: payment.therapistId
    });
  }

  private async _handlePaymentFailed(intent: Stripe.PaymentIntent) {
    const payment = await this._paymentRepo.findByPaymentIntentId(intent.id);
    if (!payment) return;

    await this._paymentRepo.updateStatus(payment.id!, PAYMENT_STATUS.FAILED);
    
    this._logger.warn("Processed payment failure webhook", { paymentId: payment.id });
  }
}
