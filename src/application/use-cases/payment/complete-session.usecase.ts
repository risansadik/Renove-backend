import type { IBookingRepository } from "../../../domain/repositories/booking.repository.js";
import type { IWalletRepository } from "../../../domain/repositories/wallet.repository.js";
import type { IPaymentRepository } from "../../../domain/repositories/payment.repository.js";
import { BOOKING_STATUS, HttpStatus } from "../../../shared/constants/index.js";
import { AppError } from "../../../shared/utils/AppError.js";
import { logger } from "../../../shared/utils/logger.js";

export class CompleteSessionUseCase {
  constructor(
    private _bookingRepo: IBookingRepository,
    private _walletRepo: IWalletRepository,
    private _paymentRepo: IPaymentRepository
  ) {}

  /**
   * Finalizes a session, marking booking as completed and moving funds to available balance.
   */
  async execute(bookingId: string, therapistId: string) {
    const booking = await this._bookingRepo.findById(bookingId);

    if (!booking) {
      throw new AppError("Booking not found", HttpStatus.NOT_FOUND);
    }

    const bookingTherapistId = typeof booking.therapistId === 'object' ? (booking.therapistId as any).id : booking.therapistId;
    if (bookingTherapistId !== therapistId) {
      throw new AppError("Unauthorized: Only the assigned therapist can complete this session", HttpStatus.FORBIDDEN);
    }

    if (booking.status !== BOOKING_STATUS.CONFIRMED) {
      throw new AppError(`Only confirmed bookings can be completed. Current status: ${booking.status}`, HttpStatus.BAD_REQUEST);
    }

    // --- NEW: Time Validation ---
    // Ensure the session has actually started before it can be completed
    if (booking.slotId && typeof booking.slotId === 'object') {
      const sessionStartTime = (booking.slotId as any).startTime;
      if (sessionStartTime && new Date() < new Date(sessionStartTime)) {
        throw new AppError("Cannot complete a session that hasn't started yet", HttpStatus.BAD_REQUEST);
      }
    }

    // 1. Update Booking Status to COMPLETED
    await this._bookingRepo.updateStatus(bookingId, BOOKING_STATUS.COMPLETED);

    // 2. Find associated successful payment to get amount
    const payment = await this._paymentRepo.findByBookingId(bookingId);
    
    if (!payment) {
      logger.warn(`No PAID payment record found for booking ${bookingId} during completion. Funds will not be moved.`);
      return { success: true, message: "Booking completed, but no payment record found for fund transfer." };
    }

    // 3. Move funds in Wallet
    const feeToMove = payment.consultationFee ?? payment.amount;
    await this._walletRepo.movePendingToAvailable(bookingTherapistId, feeToMove);

    // 4. Update ledger transaction status to completed
    const matched = await this._walletRepo.updateTransactionStatusByBookingId(bookingId, "completed");
    
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

    logger.info(`Session ${bookingId} completed. Moved ${feeToMove} to clinician ${bookingTherapistId} available balance.`);

    return { success: true };
  }
}
