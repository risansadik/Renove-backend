import { stripe } from "../../../shared/utils/stripe.js";
import type { IPaymentRepository } from "../../../domain/repositories/payment.repository.js";
import type { IBookingRepository } from "../../../domain/repositories/booking.repository.js";
import type { IWalletRepository } from "../../../domain/repositories/wallet.repository.js";
import type { ISlotRepository } from "../../../domain/repositories/availability.repository.js";
import { BOOKING_STATUS, PAYMENT_STATUS, SLOT_STATUS, HttpStatus } from "../../../shared/constants/index.js";
import { AppError } from "../../../shared/utils/AppError.js";

export class VerifyPaymentUseCase {
    constructor(
        private _paymentRepo: IPaymentRepository,
        private _bookingRepo: IBookingRepository,
        private _walletRepo: IWalletRepository,
        private _slotRepo: ISlotRepository
    ) { }

    async execute(bookingId: string, _userId: string) {
        // 1. Find local payment record
        const payment = await this._paymentRepo.findByBookingId(bookingId);
        // findByBookingId checks status=paid, so try unpaid too
        const anyPayment = payment ?? await this._findUnpaidByBookingId(bookingId);

        if (!anyPayment) {
            throw new AppError("Payment record not found", HttpStatus.NOT_FOUND);
        }

        // Already paid — idempotent
        if (anyPayment.status === PAYMENT_STATUS.PAID) {
            return { alreadyProcessed: true };
        }

        // 2. Verify with Stripe directly
        const intent = await stripe.paymentIntents.retrieve(anyPayment.paymentIntentId);

        if (intent.status !== "succeeded") {
            const message = intent.status === "requires_payment_method" 
                ? "Payment failed or was cancelled. Please try a different payment method."
                : `Payment not completed. Stripe status: ${intent.status}`;
            throw new AppError(message, HttpStatus.BAD_REQUEST);
        }

        // 3. Update payment
        await this._paymentRepo.updateStatus(anyPayment.id!, PAYMENT_STATUS.PAID, {
            paidAt: new Date(),
        });

        // 4. Update booking  ← fix Bug 1 here too
        await this._bookingRepo.updateStatus(anyPayment.bookingId, BOOKING_STATUS.CONFIRMED);

        // 5. Update slot
        const booking = await this._bookingRepo.findById(anyPayment.bookingId);
        if (booking) {
            const slotId = typeof booking.slotId === "object"
                ? (booking.slotId as any).id
                : booking.slotId;
            await this._slotRepo.updateStatus(slotId, SLOT_STATUS.BOOKED);
        }

        // 6. Add to therapist pending wallet
        const feeToCredit = anyPayment.consultationFee ?? anyPayment.amount;
        await this._walletRepo.addPendingBalance(anyPayment.therapistId, feeToCredit);

        // 7. Create ledger transaction history
        const therapistWallet = await this._walletRepo.findByTherapistId(anyPayment.therapistId);
        if (therapistWallet) {
            await this._walletRepo.createTransaction({
                walletId: therapistWallet.id!,
                walletType: "TherapistWallet",
                amount: feeToCredit,
                type: "credit",
                description: `Session payment pending (Booking: ${bookingId})`,
                status: "pending",
                bookingId: bookingId,
                consultationFee: anyPayment.consultationFee ?? anyPayment.amount,
                commissionPercentage: anyPayment.commissionPercentage ?? 0,
                platformFee: anyPayment.platformFee ?? 0,
                totalPaid: anyPayment.amount,
                therapistEarnings: feeToCredit,
            });
        }

        return { success: true };
    }

    // findByBookingId only finds paid records — we need a helper for unpaid
    private async _findUnpaidByBookingId(bookingId: string) {
        const { PaymentModel } = await import("../../../infrastructure/databases/schema/payment.schema.js");
        const doc = await PaymentModel.findOne({ bookingId });
        if (!doc) return null;
        return {
            id: doc._id.toString(),
            bookingId: doc.bookingId.toString(),
            userId: doc.userId.toString(),
            therapistId: doc.therapistId.toString(),
            paymentIntentId: doc.paymentIntentId,
            amount: doc.amount,
            consultationFee: doc.consultationFee,
            commissionPercentage: doc.commissionPercentage,
            platformFee: doc.platformFee,
            status: doc.status,
        };
    }
}