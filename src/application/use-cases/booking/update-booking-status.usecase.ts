import type { BookingEntity } from "../../../domain/entities/Booking.entity";
import type { IBookingRepository } from "../../../domain/repositories/booking.repository";
import type { IPaymentRepository } from "../../../domain/repositories/payment.repository";
import type { IWalletRepository } from "../../../domain/repositories/wallet.repository";
import type { IUserRepository } from "../../../domain/repositories/user.repository";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository";
import type { INotificationService } from "../../interfaces/services/INotificationService";
import type { IUpdateBookingStatusUseCase } from "../../interfaces/booking/IBookingUseCase";
import { BOOKING_STATUS, PAYMENT_STATUS } from "../../../shared/constants/index";
import { TYPES } from "../../../shared/constants/tokens";
import { injectable, inject } from "inversify";

@injectable()
export class UpdateBookingStatusUseCase implements IUpdateBookingStatusUseCase {
  constructor(
    @inject(TYPES.BookingRepository) private readonly _bookingRepository: IBookingRepository,
    @inject(TYPES.WalletRepository) private readonly _walletRepository: IWalletRepository,
    @inject(TYPES.PaymentRepository) private readonly _paymentRepository: IPaymentRepository,
    @inject(TYPES.UserRepository) private readonly _userRepository: IUserRepository,
    @inject(TYPES.TherapistRepository) private readonly _therapistRepository: ITherapistRepository,
    @inject(TYPES.NotificationService) private readonly _notificationService: INotificationService
  ) {}

  async execute({
    id,
    status,
    rejectionReason,
  }: {
    id: string;
    status: BookingEntity["status"];
    rejectionReason?: string;
  }): Promise<BookingEntity | null> {
    const booking = await this._bookingRepository.findById(id);
    if (!booking) return null;

    const userId =
      typeof booking.userId === "object" && booking.userId !== null
        ? (booking.userId as { id: string }).id
        : (booking.userId as string);

    const therapistId =
      typeof booking.therapistId === "object" && booking.therapistId !== null
        ? (booking.therapistId as { id: string }).id
        : (booking.therapistId as string);

    // ── Refund Logic ──────────────────────────────────────────────────────────
    if (
      (status === BOOKING_STATUS.REJECTED || status === BOOKING_STATUS.CANCELLED) &&
      booking.status !== status
    ) {
      const payment = await this._paymentRepository.findByBookingId(id);
      if (payment && payment.status === PAYMENT_STATUS.PAID) {
        let userWallet = await this._walletRepository.findByUserId(userId);
        if (!userWallet) userWallet = await this._walletRepository.createUserWallet({ userId });
        await this._walletRepository.addUserBalance(userId, payment.amount);
        await this._walletRepository.createTransaction({
          walletId: userWallet.id!,
          walletType: "UserWallet",
          amount: payment.amount,
          type: "credit",
          description: `Refund for session rejection/cancellation: ${id}`,
          status: "completed",
        });

        await this._walletRepository.addPendingBalance(therapistId, -payment.amount);
        const therapistWallet = await this._walletRepository.findByTherapistId(therapistId);
        if (therapistWallet) {
          await this._walletRepository.createTransaction({
            walletId: therapistWallet.id!,
            walletType: "TherapistWallet",
            amount: payment.amount,
            type: "debit",
            description: `Deduction for rejected/cancelled session: ${id}`,
            status: "completed",
          });
        }

        await this._paymentRepository.updateStatus(payment.id!, PAYMENT_STATUS.REFUNDED);
      }
    }

    const updatedBooking = await this._bookingRepository.updateStatus(id, status, rejectionReason);
    if (!updatedBooking) return null;

    // ── Fetch names ───────────────────────────────────────────────────────────
    const [user, therapist] = await Promise.all([
      this._userRepository.findById(userId),
      this._therapistRepository.findById(therapistId),
    ]);

    const userName = user?.name ?? "The client";
    const therapistName = therapist?.name ?? "The therapist";

    // ── Notifications ─────────────────────────────────────────────────────────
    if (status === BOOKING_STATUS.CONFIRMED) {
      await this._notificationService.createAndEmit({
        recipientId: userId,
        recipientRole: "user",
        type: "booking_confirmed",
        title: "Booking Confirmed",
        message: `${therapistName} has confirmed your session.`,
        bookingId: id,
      });
    }

    if (status === BOOKING_STATUS.REJECTED) {
      await this._notificationService.createAndEmit({
        recipientId: userId,
        recipientRole: "user",
        type: "booking_rejected",
        title: "Booking Rejected",
        message: rejectionReason
          ? `${therapistName} rejected your session. Reason: ${rejectionReason}`
          : `${therapistName} has rejected your session request.`,
        bookingId: id,
      });
    }

    if (status === BOOKING_STATUS.COMPLETED) {
      // Notify user
      await this._notificationService.createAndEmit({
        recipientId: userId,
        recipientRole: "user",
        type: "booking_completed",
        title: "Session Completed",
        message: `Your session with ${therapistName} has been marked as completed.`,
        bookingId: id,
      });

      // Notify therapist
      await this._notificationService.createAndEmit({
        recipientId: therapistId,
        recipientRole: "therapist",
        type: "booking_completed",
        title: "Session Completed",
        message: `Your session with ${userName} has been marked as completed.`,
        bookingId: id,
      });
    }

    if (status === BOOKING_STATUS.CANCELLED) {
      await this._notificationService.createAndEmit({
        recipientId: userId,
        recipientRole: "user",
        type: "booking_cancelled",
        title: "Session Cancelled",
        message: `Your session with ${therapistName} has been cancelled.`,
        bookingId: id,
      });
    }

    return updatedBooking;
  }
}