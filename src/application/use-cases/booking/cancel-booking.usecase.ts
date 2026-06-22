import type { IBookingRepository } from "../../../domain/repositories/booking.repository";
import type { ISlotRepository } from "../../../domain/repositories/availability.repository";
import type { IWalletRepository } from "../../../domain/repositories/wallet.repository";
import type { IPaymentRepository } from "../../../domain/repositories/payment.repository";
import type { IUserRepository } from "../../../domain/repositories/user.repository";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository";
import type { INotificationService } from "../../interfaces/services/INotificationService";
import type { BookingEntity } from "../../../domain/entities/Booking.entity";
import type { ICancelBookingUseCase, CancelBookingInput } from "../../interfaces/booking/IBookingUseCase";
import { BOOKING_STATUS, HttpStatus, PAYMENT_STATUS } from "../../../shared/constants/index";
import { AppError, ForbiddenError, NotFoundError } from "../../../shared/utils/AppError";
import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens";

@injectable()
export class CancelBookingUseCase implements ICancelBookingUseCase {
  constructor(
    @inject(TYPES.BookingRepository) private readonly _bookingRepo: IBookingRepository,
    @inject(TYPES.SlotRepository) private readonly _slotRepo: ISlotRepository,
    @inject(TYPES.WalletRepository) private readonly _walletRepo: IWalletRepository,
    @inject(TYPES.PaymentRepository) private readonly _paymentRepo: IPaymentRepository,
    @inject(TYPES.UserRepository) private readonly _userRepo: IUserRepository,
    @inject(TYPES.TherapistRepository) private readonly _therapistRepo: ITherapistRepository,
    @inject(TYPES.NotificationService) private readonly _notificationService: INotificationService
  ) {}

  async execute({
    bookingId,
    cancelledBy,
    userIdOrTherapistId,
    reason,
  }: CancelBookingInput): Promise<BookingEntity> {
    const booking = await this._bookingRepo.findById(bookingId);
    if (!booking) throw new NotFoundError("Booking");

    if (booking.status === BOOKING_STATUS.CANCELLED) {
      throw new AppError("Booking is already cancelled", HttpStatus.BAD_REQUEST);
    }
    if (booking.status === BOOKING_STATUS.COMPLETED) {
      throw new AppError("Cannot cancel a completed session", HttpStatus.BAD_REQUEST);
    }

    const bookingUserId =
      typeof booking.userId === "object" && booking.userId !== null
        ? (booking.userId as { id: string }).id
        : (booking.userId as string);

    const bookingTherapistId =
      typeof booking.therapistId === "object" && booking.therapistId !== null
        ? (booking.therapistId as { id: string }).id
        : (booking.therapistId as string);

    if (cancelledBy === "user" && bookingUserId !== userIdOrTherapistId) {
      throw new ForbiddenError("Unauthorized: You do not own this booking");
    }
    if (cancelledBy === "therapist" && bookingTherapistId !== userIdOrTherapistId) {
      throw new ForbiddenError("Unauthorized: You are not assigned to this booking");
    }

    const slot = await this._slotRepo.findById(
      typeof booking.slotId === "object" && booking.slotId !== null
        ? (booking.slotId as { id: string }).id
        : (booking.slotId as string)
    );
    if (!slot) throw new NotFoundError("Associated slot");

    const now = new Date();
    const startTime = new Date(slot.startTime);

    // ── Refund Policy ─────────────────────────────────────────────────────────
    const payment = await this._paymentRepo.findByBookingId(bookingId);
    let refundPercent = 0;

    if (payment && payment.status === PAYMENT_STATUS.PAID) {
      if (cancelledBy === "therapist") {
        refundPercent = 1.0;
      } else {
        const hoursDiff = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (hoursDiff > 24) {
          refundPercent = 1.0;
        } else if (hoursDiff >= 6) {
          refundPercent = 0.5;
        } else {
          refundPercent = 0.0;
        }
      }
    }

    // ── Slot ──────────────────────────────────────────────────────────────────
    if (startTime.getTime() > now.getTime()) {
      await this._slotRepo.updateStatus(slot.id!, "AVAILABLE");
    }

    // ── Wallet / Payment ──────────────────────────────────────────────────────
    if (payment && payment.status === PAYMENT_STATUS.PAID) {
      const userRefundAmount = payment.amount * refundPercent;
      const therapistDeduction = (payment.consultationFee ?? payment.amount) * refundPercent;

      await this._paymentRepo.updateStatus(payment.id!, PAYMENT_STATUS.REFUNDED, {
        refundStatus: "processed",
        refundAmount: userRefundAmount,
        refundedAt: now,
      });

      await this._walletRepo.updateTransactionStatusByBookingId(bookingId, "failed");

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
            bookingId,
            consultationFee: payment.consultationFee ?? payment.amount,
            commissionPercentage: payment.commissionPercentage ?? 0,
            platformFee: payment.platformFee ?? 0,
            totalPaid: payment.amount,
            refundAmount: userRefundAmount,
            therapistEarnings: -therapistDeduction,
          });
        }
      }

      if (userRefundAmount > 0) {
        let userWallet = await this._walletRepo.findByUserId(bookingUserId);
        if (!userWallet) userWallet = await this._walletRepo.createUserWallet({ userId: bookingUserId });
        await this._walletRepo.addUserBalance(bookingUserId, userRefundAmount);
        await this._walletRepo.createTransaction({
          walletId: userWallet.id!,
          walletType: "UserWallet",
          amount: userRefundAmount,
          type: "credit",
          description: `Refund for cancelled session: ${bookingId}`,
          status: "completed",
          bookingId,
          consultationFee: payment.consultationFee ?? payment.amount,
          commissionPercentage: payment.commissionPercentage ?? 0,
          platformFee: payment.platformFee ?? 0,
          totalPaid: payment.amount,
          refundAmount: userRefundAmount,
        });
      }
    } else if (booking.status === BOOKING_STATUS.AWAITING_PAYMENT) {
      const unpaidPayment = await this._paymentRepo.findByBookingId(bookingId);
      if (unpaidPayment) {
        await this._paymentRepo.updateStatus(unpaidPayment.id!, PAYMENT_STATUS.FAILED);
      }
    }

    // ── Update Booking ────────────────────────────────────────────────────────
    const updatedBooking = await this._bookingRepo.update(bookingId, {
      status: BOOKING_STATUS.CANCELLED,
      cancelledBy: userIdOrTherapistId,
      cancellationReason: reason,
      cancelledAt: now,
    });

    if (!updatedBooking) {
      throw new AppError("Failed to update booking status", HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const [user, therapist] = await Promise.all([
      this._userRepo.findById(bookingUserId),
      this._therapistRepo.findById(bookingTherapistId),
    ]);

    const userName = user?.name ?? "The client";
    const therapistName = therapist?.name ?? "The therapist";

    if (cancelledBy === "user") {
      await this._notificationService.createAndEmit({
        recipientId: bookingTherapistId,
        recipientRole: "therapist",
        type: "booking_cancelled",
        title: "Session Cancelled by Client",
        message: reason
          ? `${userName} cancelled their session. Reason: ${reason}`
          : `${userName} has cancelled their session.`,
        bookingId,
      });
    } else {
      await this._notificationService.createAndEmit({
        recipientId: bookingUserId,
        recipientRole: "user",
        type: "booking_cancelled",
        title: "Session Cancelled by Therapist",
        message: reason
          ? `${therapistName} cancelled your session. Reason: ${reason}`
          : `${therapistName} has cancelled your session.`,
        bookingId,
      });
    }

    return updatedBooking;
  }
}