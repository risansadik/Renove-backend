import type { IBookingRepository } from "../../../domain/repositories/booking.repository.ts";
import type { IWalletRepository } from "../../../domain/repositories/wallet.repository.ts";
import type { IPaymentRepository } from "../../../domain/repositories/payment.repository.ts";
import { BOOKING_STATUS, HttpStatus } from "../../../shared/constants/index.ts";
import { AppError } from "../../../shared/utils/AppError.ts";
import { logger } from "../../../shared/utils/logger.ts";
import { ICompleteSessionInput, ICompleteSessionUseCase } from "../../interfaces/payment/IPaymentUseCase.ts";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";

@injectable()
export class CompleteSessionUseCase implements ICompleteSessionUseCase {
  constructor(
    @inject(TYPES.BookingRepository) private readonly _bookingRepo: IBookingRepository,
    @inject(TYPES.WalletRepository) private readonly _walletRepo: IWalletRepository,
    @inject(TYPES.PaymentRepository) private readonly _paymentRepo: IPaymentRepository,
  ) { }

  async execute({ bookingId, therapistId }: ICompleteSessionInput): Promise<{ success: boolean, message?: string }> {
    const booking = await this._bookingRepo.findById(bookingId);

    if (!booking) {
      throw new AppError("Booking not found", HttpStatus.NOT_FOUND);
    }

    const bookingTherapistId = typeof booking.therapistId === 'object' && booking.therapistId !== null ? (booking.therapistId as { id: string }).id : booking.therapistId as string;
    if (bookingTherapistId !== therapistId) {
      throw new AppError("Unauthorized: Only the assigned therapist can complete this session", HttpStatus.FORBIDDEN);
    }

    if (booking.status !== BOOKING_STATUS.CONFIRMED) {
      throw new AppError(`Only confirmed bookings can be completed. Current status: ${booking.status}`, HttpStatus.BAD_REQUEST);
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
        throw new AppError(
          "Session is currently ongoing",
          HttpStatus.BAD_REQUEST
        );
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
