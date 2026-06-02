import { injectable } from "inversify";
import type { AdminFinanceStats, IFinanceRepository } from "../../domain/repositories/finance.repository.ts";
import type { TransactionEntity } from "../../domain/entities/Transaction.entity.ts";
import { PaymentModel } from "../databases/schema/payment.schema.ts";
import { TransactionModel, WalletModel } from "../databases/schema/wallet.schema.ts";

@injectable()
export class FinanceRepository implements IFinanceRepository {
  async getAdminFinanceStats(): Promise<AdminFinanceStats> {
    const wallets = await WalletModel.find({}).lean();
    const completedTransactions = await TransactionModel.find({
      walletType: "TherapistWallet",
      status: "completed",
      type: "credit",
    }).lean();
    const refundedPayments = await PaymentModel.find({ status: "refunded" }).lean();
    const transactions = await TransactionModel.find({}).sort({ createdAt: -1 }).limit(50).lean();

    const totalTherapistEarnings = wallets.reduce(
      (sum, wallet) => sum + (wallet.pendingBalance || 0) + (wallet.availableBalance || 0) + (wallet.withdrawnBalance || 0),
      0
    );
    const totalPendingPayouts = wallets.reduce((sum, wallet) => sum + (wallet.pendingBalance || 0), 0);
    const totalWithdrawn = wallets.reduce((sum, wallet) => sum + (wallet.withdrawnBalance || 0), 0);
    const totalRevenue = completedTransactions.reduce((sum, transaction) => sum + (transaction.platformFee || 0), 0);
    const totalRefunded = refundedPayments.reduce((sum, payment) => sum + (payment.refundAmount || 0), 0);

    return {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalTherapistEarnings: Number(totalTherapistEarnings.toFixed(2)),
      totalPendingPayouts: Number(totalPendingPayouts.toFixed(2)),
      totalWithdrawn: Number(totalWithdrawn.toFixed(2)),
      totalRefunded: Number(totalRefunded.toFixed(2)),
      transactions: transactions.map((transaction): TransactionEntity => ({
        id: transaction._id.toString(),
        walletId: transaction.walletId.toString(),
        amount: transaction.amount,
        type: transaction.type,
        description: transaction.description,
        status: transaction.status,
        bookingId: transaction.bookingId?.toString(),
        consultationFee: transaction.consultationFee,
        commissionPercentage: transaction.commissionPercentage,
        platformFee: transaction.platformFee,
        totalPaid: transaction.totalPaid,
        therapistEarnings: transaction.therapistEarnings,
        refundAmount: transaction.refundAmount,
        createdAt: transaction.createdAt,
      })),
    };
  }
}
