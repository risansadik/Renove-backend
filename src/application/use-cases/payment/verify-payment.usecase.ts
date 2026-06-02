import { stripe } from "../../../shared/utils/stripe.ts";
import type { IPaymentRepository } from "../../../domain/repositories/payment.repository.ts";
import type { IBookingRepository } from "../../../domain/repositories/booking.repository.ts";
import type { IWalletRepository } from "../../../domain/repositories/wallet.repository.ts";
import type { ISlotRepository } from "../../../domain/repositories/availability.repository.ts";
import { BOOKING_STATUS, PAYMENT_STATUS, SLOT_STATUS, HttpStatus } from "../../../shared/constants/index.ts";
import { AppError } from "../../../shared/utils/AppError.ts";

export class VerifyPaymentUseCase {
  constructor(
    private readonly _paymentRepo: IPaymentRepository,
    private readonly _bookingRepo: IBookingRepository,
    private readonly _walletRepo: IWalletRepository,
    private readonly _slotRepo: ISlotRepository
  ) {}

  async execute(bookingId: string, _userId: string) {
    const payment = await this._paymentRepo.findByBookingId(bookingId);
    const anyPayment = payment ?? await this._paymentRepo.findAnyByBookingId(bookingId);

    if (!anyPayment) {
      throw new AppError("Payment record not found", HttpStatus.NOT_FOUND);
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
        ? booking.slotId.id
        : booking.slotId;
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

    return { success: true };
  }
}
