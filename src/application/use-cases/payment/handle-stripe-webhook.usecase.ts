import type { IPaymentRepository } from "../../../domain/repositories/payment.repository";
import type { IBookingRepository } from "../../../domain/repositories/booking.repository";
import type { IWalletRepository } from "../../../domain/repositories/wallet.repository";
import type { ISlotRepository } from "../../../domain/repositories/availability.repository";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository";
import type { INotificationService } from "../../interfaces/services/INotificationService";
import { BOOKING_STATUS, PAYMENT_STATUS, SLOT_STATUS } from "../../../shared/constants/index";
import Stripe from "stripe";
import { IHandleStripeWebhookInput, IHandleStripeWebhookUseCase } from "../../interfaces/payment/IPaymentUseCase";
import { injectable,inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens";
import { StripeHelper } from "../../../shared/utils/stripe";
import type { ILogger } from "../../interfaces/services/ILoggerService";

@injectable()
export class HandleStripeWebhookUseCase implements IHandleStripeWebhookUseCase{
  constructor(
   @inject(TYPES.PaymentRepository) private _paymentRepo: IPaymentRepository,
   @inject(TYPES.BookingRepository) private _bookingRepo: IBookingRepository,
   @inject(TYPES.WalletRepository) private _walletRepo: IWalletRepository,
   @inject(TYPES.SlotRepository) private _slotRepo: ISlotRepository,
   @inject(TYPES.TherapistRepository) private readonly _therapistRepo: ITherapistRepository,
   @inject(TYPES.NotificationService) private readonly _notificationService: INotificationService,
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

    // 6. Notify user of payment confirmation
    const userId = typeof payment.userId === "object" && payment.userId !== null
      ? (payment.userId as { id: string }).id
      : (payment.userId as string);
    const therapist = await this._therapistRepo.findById(payment.therapistId);
    const therapistName = therapist?.name ?? "your therapist";
    await this._notificationService.createAndEmit({
      recipientId: userId,
      recipientRole: "user",
      type: "payment_confirmed",
      title: "Payment Confirmed",
      message: `Your payment was successful. Your session with ${therapistName} is now confirmed.`,
      bookingId: payment.bookingId,
    });

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

    // Notify user of payment failure
    const userId = typeof payment.userId === "object" && payment.userId !== null
      ? (payment.userId as { id: string }).id
      : (payment.userId as string);
    await this._notificationService.createAndEmit({
      recipientId: userId,
      recipientRole: "user",
      type: "payment_failed",
      title: "Payment Failed",
      message: "Your payment could not be processed. Please try again with a different payment method.",
      bookingId: payment.bookingId,
    });
    
    this._logger.warn("Processed payment failure webhook", { paymentId: payment.id });
  }
}
