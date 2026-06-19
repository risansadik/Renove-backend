import type { IBookingRepository } from "../../../domain/repositories/booking.repository.ts";
import type { IWalletRepository } from "../../../domain/repositories/wallet.repository.ts";
import type { IPaymentRepository } from "../../../domain/repositories/payment.repository.ts";
import type { IUserRepository } from "../../../domain/repositories/user.repository.ts";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.ts";
import type { INotificationService } from "../../interfaces/services/INotificationService.ts";
import { BOOKING_STATUS, HttpStatus } from "../../../shared/constants/index.ts";
import { AppError } from "../../../shared/utils/AppError.ts";
import { ICompleteSessionInput, ICompleteSessionUseCase } from "../../interfaces/payment/IPaymentUseCase.ts";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import { ILogger } from "../../interfaces/services/ILoggerService.ts";
import type { IExtendTherapistChatWindowUseCase } from "../../interfaces/therapist-chat/ITherapistChatUseCase.ts";

@injectable()
export class CompleteSessionUseCase implements ICompleteSessionUseCase {
  constructor(
    @inject(TYPES.BookingRepository) private readonly _bookingRepo: IBookingRepository,
    @inject(TYPES.WalletRepository) private readonly _walletRepo: IWalletRepository,
    @inject(TYPES.PaymentRepository) private readonly _paymentRepo: IPaymentRepository,
    @inject(TYPES.UserRepository) private readonly _userRepo: IUserRepository,
    @inject(TYPES.TherapistRepository) private readonly _therapistRepo: ITherapistRepository,
    @inject(TYPES.NotificationService) private readonly _notificationService: INotificationService,
    @inject(TYPES.Logger) private readonly _logger: ILogger,
    @inject(TYPES.ExtendTherapistChatWindowUseCase) private readonly _extendChatWindowUC: IExtendTherapistChatWindowUseCase
  ) { }

  async execute({
    bookingId,
    therapistId,
  }: ICompleteSessionInput): Promise<{ success: boolean; message?: string }> {
    const booking = await this._bookingRepo.findById(bookingId);

    if (!booking) {
      throw new AppError("Booking not found", HttpStatus.NOT_FOUND);
    }

    const bookingTherapistId =
      typeof booking.therapistId === "object" && booking.therapistId !== null
        ? (booking.therapistId as { id: string }).id
        : (booking.therapistId as string);

    if (bookingTherapistId !== therapistId) {
      throw new AppError(
        "Unauthorized: Only the assigned therapist can complete this session",
        HttpStatus.FORBIDDEN
      );
    }

    if (booking.status !== BOOKING_STATUS.CONFIRMED) {
      throw new AppError(
        `Only confirmed bookings can be completed. Current status: ${booking.status}`,
        HttpStatus.BAD_REQUEST
      );
    }

    if (booking.slotId && typeof booking.slotId === "object" && booking.slotId !== null) {
      const slot = booking.slotId as {
        startTime?: string | Date;
        endTime?: string | Date;
      };

      const now = Date.now();

      if (slot.startTime && now < new Date(slot.startTime).getTime()) {
        throw new AppError(
          "Cannot complete a session that hasn't started yet",
          HttpStatus.BAD_REQUEST
        );
      }

      if (
        slot.startTime &&
        slot.endTime &&
        now >= new Date(slot.startTime).getTime() &&
        now <= new Date(slot.endTime).getTime()
      ) {
        throw new AppError("Session is currently ongoing", HttpStatus.BAD_REQUEST);
      }
    }

    // 1. Update Booking Status to COMPLETED
    await this._bookingRepo.updateStatus(bookingId, BOOKING_STATUS.COMPLETED);

    // 2. Extract userId for chat window extension
    const bookingUserId =
      typeof booking.userId === "object" && booking.userId !== null
        ? (booking.userId as { id: string }).id
        : (booking.userId as string);

    // 3. Extend (or open) the 5-day therapist chat window for this user-therapist pair
    await this._extendChatWindowUC.execute({
      userId: bookingUserId,
      therapistId: bookingTherapistId,
      bookingId,
    });

    this._logger.info(
      `Chat window extended for user ${bookingUserId} <-> therapist ${bookingTherapistId} after session ${bookingId}`
    );

    // 4. Find associated successful payment to get amount
    const payment = await this._paymentRepo.findByBookingId(bookingId);

    if (!payment) {
      this._logger.warn(
        `No PAID payment record found for booking ${bookingId} during completion. Funds will not be moved.`
      );
      return {
        success: true,
        message: "Booking completed, but no payment record found for fund transfer.",
      };
    }

    // 5. Move funds in Wallet
    const feeToMove = payment.consultationFee ?? payment.amount;
    await this._walletRepo.movePendingToAvailable(bookingTherapistId, feeToMove);

    // 6. Update ledger transaction status to completed
    const matched = await this._walletRepo.updateTransactionStatusByBookingId(
      bookingId,
      "completed"
    );

    if (!matched) {
      const wallet = await this._walletRepo.findByTherapistId(bookingTherapistId);
      if (wallet) {
        await this._walletRepo.createTransaction({
          walletId: wallet.id!,
          walletType: "TherapistWallet",
          amount: feeToMove,
          type: "credit",
          description: `Earnings from completed session: ${bookingId}`,
          status: "completed",
          bookingId: bookingId,
          consultationFee: payment.consultationFee ?? payment.amount,
          commissionPercentage: payment.commissionPercentage ?? 0,
          platformFee: payment.platformFee ?? 0,
          totalPaid: payment.amount,
          therapistEarnings: feeToMove,
        });
      }
    }

    this._logger.info(
      `Session ${bookingId} completed. Moved ${feeToMove} to clinician ${bookingTherapistId} available balance.`
    );

    // 7. Notify both parties of session completion
    const [user, therapist] = await Promise.all([
      this._userRepo.findById(bookingUserId),
      this._therapistRepo.findById(bookingTherapistId),
    ]);

    const userName = user?.name ?? "The client";
    const therapistName = therapist?.name ?? "The therapist";

    await Promise.all([
      this._notificationService.createAndEmit({
        recipientId: bookingUserId,
        recipientRole: "user",
        type: "booking_completed",
        title: "Session Completed",
        message: `Your session with ${therapistName} has been marked as completed.`,
        bookingId,
      }),
      this._notificationService.createAndEmit({
        recipientId: bookingTherapistId,
        recipientRole: "therapist",
        type: "booking_completed",
        title: "Session Completed",
        message: `Your session with ${userName} has been marked as completed.`,
        bookingId,
      }),
    ]);

    return { success: true };
  }
}