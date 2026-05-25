import type { IWalletRepository } from "../../domain/repositories/wallet.repository.ts";
import type { TherapistWalletEntity } from "../../domain/entities/TherapistWallet.entity.ts";
import type { UserWalletEntity } from "../../domain/entities/UserWallet.entity.ts";
import type { TransactionEntity } from "../../domain/entities/Transaction.entity.ts";
import { 
  WalletModel, 
  UserWalletModel, 
  TransactionModel, 
  type IWalletDocument, 
  type IUserWalletDocument, 
  type ITransactionDocument 
} from "../databases/schema/wallet.schema.ts";

import { PaginationParams, PaginatedResult } from "../../domain/interfaces/pagination.ts";

export class WalletRepositoryImpl implements IWalletRepository {
  // --- Helpers ---
  private _toTherapistEntity(doc: IWalletDocument): TherapistWalletEntity {
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

  private _toUserEntity(doc: IUserWalletDocument): UserWalletEntity {
    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      balance: doc.balance,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  private _toTransactionEntity(doc: ITransactionDocument): TransactionEntity {
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

  // --- Therapist Wallet ---
  async findByTherapistId(therapistId: string): Promise<TherapistWalletEntity | null> {
    const doc = await WalletModel.findOne({ therapistId });
    return doc ? this._toTherapistEntity(doc) : null;
  }

  async createTherapistWallet(wallet: Partial<TherapistWalletEntity>): Promise<TherapistWalletEntity> {
    const doc = await WalletModel.create(wallet);
    return this._toTherapistEntity(doc);
  }

  async addPendingBalance(therapistId: string, amount: number): Promise<TherapistWalletEntity | null> {
    const doc = await WalletModel.findOneAndUpdate(
      { therapistId },
      { $inc: { pendingBalance: amount } },
      { new: true, upsert: true }
    );
    return doc ? this._toTherapistEntity(doc) : null;
  }

  async movePendingToAvailable(therapistId: string, amount: number): Promise<TherapistWalletEntity | null> {
    const doc = await WalletModel.findOneAndUpdate(
      { therapistId, pendingBalance: { $gte: amount } },
      { 
        $inc: { 
          pendingBalance: -amount,
          availableBalance: amount 
        } 
      },
      { new: true }
    );
    return doc ? this._toTherapistEntity(doc) : null;
  }

  // --- User Wallet ---
  async findByUserId(userId: string): Promise<UserWalletEntity | null> {
    const doc = await UserWalletModel.findOne({ userId });
    return doc ? this._toUserEntity(doc) : null;
  }

  async createUserWallet(wallet: Partial<UserWalletEntity>): Promise<UserWalletEntity> {
    const doc = await UserWalletModel.create(wallet);
    return this._toUserEntity(doc);
  }

  async addUserBalance(userId: string, amount: number): Promise<UserWalletEntity | null> {
    const doc = await UserWalletModel.findOneAndUpdate(
      { userId },
      { $inc: { balance: amount } },
      { new: true, upsert: true }
    );
    return doc ? this._toUserEntity(doc) : null;
  }

  // --- Transactions ---
  async getTransactions(walletId: string, walletType: "TherapistWallet" | "UserWallet", params?: PaginationParams): Promise<PaginatedResult<TransactionEntity>> {
    const query = TransactionModel.find({ walletId, walletType }).sort({ createdAt: -1 });
    
    if (params) {
      query.skip((params.page - 1) * params.limit).limit(params.limit);
    }

    const [docs, total] = await Promise.all([
      query.lean().exec(),
      TransactionModel.countDocuments({ walletId, walletType })
    ]);

    return {
      data: docs.map(doc => this._toTransactionEntity(doc as unknown as ITransactionDocument)),
      total
    };
  }

  async createTransaction(transaction: Partial<TransactionEntity> & { walletType: string }): Promise<TransactionEntity> {
    const doc = await TransactionModel.create(transaction);
    return this._toTransactionEntity(doc);
  }

  async updateTransactionStatusByBookingId(bookingId: string, status: "pending" | "completed" | "failed"): Promise<boolean> {
    const res = await TransactionModel.updateMany({ bookingId }, { status });
    return res.matchedCount > 0;
  }
}
