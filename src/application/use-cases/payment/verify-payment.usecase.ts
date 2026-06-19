import { stripe } from "../../../shared/utils/stripe.ts";
import type { IPaymentRepository } from "../../../domain/repositories/payment.repository.ts";
import type { IBookingRepository } from "../../../domain/repositories/booking.repository.ts";
import type { IWalletRepository } from "../../../domain/repositories/wallet.repository.ts";
import type { ISlotRepository } from "../../../domain/repositories/availability.repository.ts";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.ts";
import type { INotificationService } from "../../interfaces/services/INotificationService.ts";
import { BOOKING_STATUS, PAYMENT_STATUS, SLOT_STATUS, HttpStatus } from "../../../shared/constants/index.ts";
import { AppError } from "../../../shared/utils/AppError.ts";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import { IVerifyPaymentInput, IVerifyPaymentUseCase } from "../../interfaces/payment/IPaymentUseCase.ts";

@injectable()
export class VerifyPaymentUseCase implements IVerifyPaymentUseCase{
  constructor(
    @inject(TYPES.PaymentRepository) private readonly _paymentRepo: IPaymentRepository,
    @inject(TYPES.BookingRepository) private readonly _bookingRepo: IBookingRepository,
    @inject(TYPES.WalletRepository) private readonly _walletRepo: IWalletRepository,
    @inject(TYPES.SlotRepository) private readonly _slotRepo: ISlotRepository,
    @inject(TYPES.TherapistRepository) private readonly _therapistRepo: ITherapistRepository,
    @inject(TYPES.NotificationService) private readonly _notificationService: INotificationService
  ) {}

  async execute({bookingId, userId} : IVerifyPaymentInput) : Promise<{success?: boolean,alreadyProcessed?: boolean}>{
    const payment = await this._paymentRepo.findByBookingId(bookingId);
    const anyPayment = payment ?? await this._paymentRepo.findAnyByBookingId(bookingId);

    if (!anyPayment) {
      throw new AppError("Payment record not found", HttpStatus.NOT_FOUND);
    }

    const paymentUserId = typeof anyPayment.userId === 'object' && anyPayment.userId !== null 
      ? (anyPayment.userId as { id: string }).id 
      : (anyPayment.userId as string);

    if (paymentUserId !== userId) {
      throw new AppError("Unauthorized access to payment verification", HttpStatus.FORBIDDEN);
    }

    if (anyPayment.status === PAYMENT_STATUS.PAID) {
      return { alreadyProcessed: true };
    }

    const intent = await stripe.paymentIntents.retrieve(anyPayment.paymentIntentId);

    if (intent.status !== "succeeded") {
      const message = intent.status === "requires_payment_method"
        ? "Payment failed or was cancelled. Please try a different payment method."
        : `Payment not completed. Stripe status: ${intent.status}`;
      throw new AppError(message, HttpStatus.BAD_REQUEST);
    }

    await this._paymentRepo.updateStatus(anyPayment.id!, PAYMENT_STATUS.PAID, {
      paidAt: new Date(),
    });

    await this._bookingRepo.updateStatus(anyPayment.bookingId, BOOKING_STATUS.CONFIRMED);

    const booking = await this._bookingRepo.findById(anyPayment.bookingId);
    if (booking) {
      const slotId = typeof booking.slotId === "object" && booking.slotId !== null
        ? (booking.slotId as { id: string }).id
        : (booking.slotId as string);
      await this._slotRepo.updateStatus(slotId, SLOT_STATUS.BOOKED);
    }

    const feeToCredit = anyPayment.consultationFee ?? anyPayment.amount;
    await this._walletRepo.addPendingBalance(anyPayment.therapistId, feeToCredit);

    const therapistWallet = await this._walletRepo.findByTherapistId(anyPayment.therapistId);
    if (therapistWallet) {
      await this._walletRepo.createTransaction({
        walletId: therapistWallet.id!,
        walletType: "TherapistWallet",
        amount: feeToCredit,
        type: "credit",
        description: `Session payment pending (Booking: ${bookingId})`,
        status: "pending",
        bookingId,
        consultationFee: anyPayment.consultationFee ?? anyPayment.amount,
        commissionPercentage: anyPayment.commissionPercentage ?? 0,
        platformFee: anyPayment.platformFee ?? 0,
        totalPaid: anyPayment.amount,
        therapistEarnings: feeToCredit,
      });
    }

    // Notify user of payment confirmation
    const therapist = await this._therapistRepo.findById(anyPayment.therapistId);
    const therapistName = therapist?.name ?? "your therapist";
    await this._notificationService.createAndEmit({
      recipientId: userId,
      recipientRole: "user",
      type: "payment_confirmed",
      title: "Payment Confirmed",
      message: `Your payment was successful. Your session with ${therapistName} is now confirmed.`,
      bookingId,
    });

    return { success: true };
  }
}
