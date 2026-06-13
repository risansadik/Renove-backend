import type { IWalletDocument, IUserWalletDocument, ITransactionDocument } from "../databases/schema/wallet.schema.ts";
import type { TherapistWalletEntity } from "../../domain/entities/TherapistWallet.entity.ts";
import type { UserWalletEntity } from "../../domain/entities/UserWallet.entity.ts";
import type { TransactionEntity } from "../../domain/entities/Transaction.entity.ts";

export class WalletDbMapper {
  static toTherapistEntity(doc: IWalletDocument): TherapistWalletEntity {
    return {
      id: doc._id.toString(),
      therapistId: doc.therapistId.toString(),
      pendingBalance: doc.pendingBalance,
      availableBalance: doc.availableBalance,
      withdrawnBalance: doc.withdrawnBalance,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  static toUserEntity(doc: IUserWalletDocument): UserWalletEntity {
    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      balance: doc.balance,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  static toTransactionEntity(doc: ITransactionDocument): TransactionEntity {
    return {
      id: doc._id.toString(),
      walletId: doc.walletId.toString(),
      amount: doc.amount,
      type: doc.type as "credit" | "debit",
      description: doc.description,
      status: doc.status as "pending" | "completed" | "failed",
      bookingId: doc.bookingId?.toString(),
      consultationFee: doc.consultationFee,
      commissionPercentage: doc.commissionPercentage,
      platformFee: doc.platformFee,
      totalPaid: doc.totalPaid,
      therapistEarnings: doc.therapistEarnings,
      refundAmount: doc.refundAmount,
      createdAt: doc.createdAt,
    };
  }
}
