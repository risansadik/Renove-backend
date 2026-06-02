import { BookingEntity } from "../../../domain/entities/Booking.entity.ts";
import { IBookingRepository } from "../../../domain/repositories/booking.repository.ts";
import { IPaymentRepository } from "../../../domain/repositories/payment.repository.ts";
import { IWalletRepository } from "../../../domain/repositories/wallet.repository.ts";
import { BOOKING_STATUS, PAYMENT_STATUS } from "../../../shared/constants/index.ts";
import { TYPES } from "../../../shared/constants/tokens.ts";
import { IUpdateBookingStatusUseCase } from "../../interfaces/booking/IBookingUseCase.ts";
import { injectable, inject } from "inversify";

@injectable()
export class UpdateBookingStatusUseCase implements IUpdateBookingStatusUseCase {
  constructor(
    @inject(TYPES.BookingRepository) private readonly _bookingRepository: IBookingRepository,
    @inject(TYPES.WalletRepository) private readonly _walletRepository: IWalletRepository,
    @inject(TYPES.PaymentRepository) private readonly _paymentRepository: IPaymentRepository
  ) { }

  async execute({ id, status, rejectionReason }: { id: string; status: BookingEntity["status"]; rejectionReason?: string }): Promise<BookingEntity | null> {
    const booking = await this._bookingRepository.findById(id);
    if (!booking) return null;

    // Handle Refund Logic if rejected or cancelled after payment
    if ((status === BOOKING_STATUS.REJECTED || status === BOOKING_STATUS.CANCELLED) && booking.status !== status) {
      const payment = await this._paymentRepository.findByBookingId(id);
      if (payment && payment.status === PAYMENT_STATUS.PAID) {
        const userId = typeof booking.userId === "object" && booking.userId !== null ? (booking.userId as { id: string }).id : booking.userId as string;
        const therapistId = typeof booking.therapistId === "object" && booking.therapistId !== null ? (booking.therapistId as { id: string }).id : booking.therapistId as string;

        // 1. Credit User Wallet
        let userWallet = await this._walletRepository.findByUserId(userId);
        if (!userWallet) userWallet = await this._walletRepository.createUserWallet({ userId });
        await this._walletRepository.addUserBalance(userId, payment.amount);
        await this._walletRepository.createTransaction({
          walletId: userWallet.id!,
          walletType: "UserWallet",
          amount: payment.amount,
          type: "credit",
          description: `Refund for session rejection/cancellation: ${id}`,
          status: "completed"
        });

        // 2. Debit Therapist Pending Wallet (if it was added during verify-payment)
        await this._walletRepository.addPendingBalance(therapistId, -payment.amount);
        const therapistWallet = await this._walletRepository.findByTherapistId(therapistId);
        if (therapistWallet) {
          await this._walletRepository.createTransaction({
            walletId: therapistWallet.id!,
            walletType: "TherapistWallet",
            amount: payment.amount,
            type: "debit",
            description: `Deduction for rejected/cancelled session: ${id}`,
            status: "completed"
          });
        }

        // 3. Update payment status locally
        await this._paymentRepository.updateStatus(payment.id!, PAYMENT_STATUS.REFUNDED);
      }
    }

    return await this._bookingRepository.updateStatus(id, status, rejectionReason);
  }
}