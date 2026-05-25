import type { IBookingRepository } from "../../../domain/repositories/booking.repository.ts";
import type { ISlotRepository } from "../../../domain/repositories/availability.repository.ts";
import type { IWalletRepository } from "../../../domain/repositories/wallet.repository.ts";
import type { IPaymentRepository } from "../../../domain/repositories/payment.repository.ts";
import type { BookingEntity } from "../../../domain/entities/Booking.entity.ts";
import type { ICancelBookingUseCase, CancelBookingInput } from "../../interfaces/booking/IBookingUseCase.ts";
import { BOOKING_STATUS, PAYMENT_STATUS } from "../../../shared/constants/index.ts";

export class CancelBookingUseCase implements ICancelBookingUseCase {
  constructor(
    private _bookingRepo: IBookingRepository,
    private _slotRepo: ISlotRepository,
    private _walletRepo: IWalletRepository,
    private _paymentRepo: IPaymentRepository
  ) {}

  async execute({ bookingId, cancelledBy, userIdOrTherapistId, reason }: CancelBookingInput): Promise<BookingEntity> {
    const booking = await this._bookingRepo.findById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status === BOOKING_STATUS.CANCELLED) {
      throw new Error("Booking is already cancelled");
    }

    if (booking.status === BOOKING_STATUS.COMPLETED) {
      throw new Error("Cannot cancel a completed session");
    }

    // Authorization checks
    const bookingUserId = typeof booking.userId === "object" && booking.userId !== null ? (booking.userId as { id: string }).id : booking.userId as string;
    const bookingTherapistId = typeof booking.therapistId === "object" && booking.therapistId !== null ? (booking.therapistId as { id: string }).id : booking.therapistId as string;

    if (cancelledBy === "user" && bookingUserId !== userIdOrTherapistId) {
      throw new Error("Unauthorized: You do not own this booking");
    }
    if (cancelledBy === "therapist" && bookingTherapistId !== userIdOrTherapistId) {
      throw new Error("Unauthorized: You are not assigned to this booking");
    }

    const slot = await this._slotRepo.findById(
      typeof booking.slotId === "object" && booking.slotId !== null ? (booking.slotId as { id: string }).id : booking.slotId as string
    );
    if (!slot) {
      throw new Error("Associated slot not found");
    }

    const now = new Date();
    const startTime = new Date(slot.startTime);

    // 1. Calculate Refund Policy if payment is PAID
    const payment = await this._paymentRepo.findByBookingId(bookingId);
    let refundPercent = 0;
    
    if (payment && payment.status === PAYMENT_STATUS.PAID) {
      if (cancelledBy === "therapist") {
        refundPercent = 1.0; // 100% refund if therapist cancels
      } else {
        const hoursDiff = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (hoursDiff > 24) {
          refundPercent = 1.0; // > 24 hours: 100% refund
        } else if (hoursDiff >= 6) {
          refundPercent = 0.5; // 6 to 24 hours: 50% refund
        } else {
          refundPercent = 0.0; // < 6 hours: no refund
        }
      }
    }

    // 2. Perform updates
    // A. Reopen Slot only if session time has not passed
    if (startTime.getTime() > now.getTime()) {
      await this._slotRepo.updateStatus(slot.id!, "AVAILABLE");
    }

    // B. Handle payment refund status & wallet adjustment if payment was PAID
    if (payment && payment.status === PAYMENT_STATUS.PAID) {
      const userRefundAmount = payment.amount * refundPercent;
      const therapistDeduction = (payment.consultationFee ?? payment.amount) * refundPercent;

      // Update payment record to processed refund status
      await this._paymentRepo.updateStatus(payment.id!, PAYMENT_STATUS.REFUNDED, {
        refundStatus: "processed",
        refundAmount: userRefundAmount,
        refundedAt: now
      });

      // Update original pending transaction status to failed
      await this._walletRepo.updateTransactionStatusByBookingId(bookingId, "failed");

      // Deduct therapistDeduction from therapist pending wallet
      if (therapistDeduction > 0) {
        await this._walletRepo.addPendingBalance(bookingTherapistId, -therapistDeduction);

        const therapistWallet = await this._walletRepo.findByTherapistId(bookingTherapistId);
        if (therapistWallet) {
          await this._walletRepo.createTransaction({
            walletId: therapistWallet.id!,
            walletType: "TherapistWallet",
            amount: therapistDeduction,
            type: "debit",
            description: `Deduction for cancelled session: ${bookingId}`,
            status: "completed",
            bookingId: bookingId,
            consultationFee: payment.consultationFee ?? payment.amount,
            commissionPercentage: payment.commissionPercentage ?? 0,
            platformFee: payment.platformFee ?? 0,
            totalPaid: payment.amount,
            refundAmount: userRefundAmount,
            therapistEarnings: -therapistDeduction,
          });
        }
      }

      // Credit the patient's User Wallet
      if (userRefundAmount > 0) {
        let userWallet = await this._walletRepo.findByUserId(bookingUserId);
        if (!userWallet) {
          userWallet = await this._walletRepo.createUserWallet({ userId: bookingUserId });
        }

        await this._walletRepo.addUserBalance(bookingUserId, userRefundAmount);
        await this._walletRepo.createTransaction({
          walletId: userWallet.id!,
          walletType: "UserWallet",
          amount: userRefundAmount,
          type: "credit",
          description: `Refund for cancelled session: ${bookingId}`,
          status: "completed",
          bookingId: bookingId,
          consultationFee: payment.consultationFee ?? payment.amount,
          commissionPercentage: payment.commissionPercentage ?? 0,
          platformFee: payment.platformFee ?? 0,
          totalPaid: payment.amount,
          refundAmount: userRefundAmount,
        });
      }
    } else if (booking.status === BOOKING_STATUS.AWAITING_PAYMENT) {
      // If booking was awaiting payment, mark payment as FAILED if intent exists
      const unpaidPayment = await this._paymentRepo.findByBookingId(bookingId);
      if (unpaidPayment) {
        await this._paymentRepo.updateStatus(unpaidPayment.id!, PAYMENT_STATUS.FAILED);
      }
    }

    // C. Update Booking Entity status & cancellation details
    const updatedBooking = await this._bookingRepo.update(bookingId, {
      status: BOOKING_STATUS.CANCELLED,
      cancelledBy: userIdOrTherapistId,
      cancellationReason: reason,
      cancelledAt: now
    });

    if (!updatedBooking) {
      throw new Error("Failed to update booking status");
    }

    return updatedBooking;
  }
}
