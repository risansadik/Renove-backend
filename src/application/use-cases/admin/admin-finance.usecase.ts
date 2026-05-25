import { ISettingsRepository } from "../../../domain/repositories/settings.repository.ts";
import { WalletModel, TransactionModel } from "../../../infrastructure/databases/schema/wallet.schema.ts";
import { PaymentModel } from "../../../infrastructure/databases/schema/payment.schema.ts";
import { HttpStatus } from "../../../shared/constants/index.ts";
import { AppError } from "../../../shared/utils/AppError.ts";

export class GetAdminFinanceStatsUseCase {
  constructor(private _settingsRepo: ISettingsRepository) {}

  async execute() {
    // 1. Calculate Therapist earnings, pending, withdrawn
    const wallets = await WalletModel.find({}).lean();
    let totalTherapistEarnings = 0;
    let totalPendingPayouts = 0;
    let totalWithdrawn = 0;

    for (const w of wallets) {
      totalTherapistEarnings += (w.pendingBalance || 0) + (w.availableBalance || 0) + (w.withdrawnBalance || 0);
      totalPendingPayouts += w.pendingBalance || 0;
      totalWithdrawn += w.withdrawnBalance || 0;
    }

    // 2. Calculate platform revenue (sum of completed transactions' platformFee)
    const completedTransactions = await TransactionModel.find({ 
      walletType: "TherapistWallet", 
      status: "completed", 
      type: "credit" 
    }).lean();

    let totalRevenue = 0;
    for (const t of completedTransactions) {
      totalRevenue += t.platformFee || 0;
    }

    // 3. Calculate total refunds processed
    const refundedPayments = await PaymentModel.find({ 
      status: "refunded" 
    }).lean();

    let totalRefunded = 0;
    for (const p of refundedPayments) {
      totalRefunded += p.refundAmount || 0;
    }

    // 4. Fetch current commission settings
    const commissionPercentage = await this._settingsRepo.getCommissionPercentage();

    // 5. Fetch all transaction ledgers for audit table, sorted by date
    const transactions = await TransactionModel.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalTherapistEarnings: Number(totalTherapistEarnings.toFixed(2)),
      totalPendingPayouts: Number(totalPendingPayouts.toFixed(2)),
      totalWithdrawn: Number(totalWithdrawn.toFixed(2)),
      totalRefunded: Number(totalRefunded.toFixed(2)),
      commissionPercentage,
      transactions: transactions.map(t => ({
        id: t._id.toString(),
        walletId: t.walletId.toString(),
        walletType: t.walletType,
        amount: t.amount,
        type: t.type,
        description: t.description,
        status: t.status,
        bookingId: t.bookingId?.toString(),
        consultationFee: t.consultationFee,
        commissionPercentage: t.commissionPercentage,
        platformFee: t.platformFee,
        totalPaid: t.totalPaid,
        therapistEarnings: t.therapistEarnings,
        refundAmount: t.refundAmount,
        createdAt: t.createdAt,
      })),
    };
  }
}

export class UpdatePlatformSettingsUseCase {
  constructor(private _settingsRepo: ISettingsRepository) {}

  async execute(percentage: number) {
    if (percentage < 0 || percentage > 100) {
      throw new AppError("Commission percentage must be between 0 and 100", HttpStatus.BAD_REQUEST);
    }
    await this._settingsRepo.updateCommissionPercentage(percentage);
    return { success: true, message: `Platform commission updated to ${percentage}%` };
  }
}
