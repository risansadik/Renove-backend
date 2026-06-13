import { injectable } from "inversify";
import type { IWalletRepository } from "../../domain/repositories/wallet.repository.ts";
import type { TherapistWalletEntity } from "../../domain/entities/TherapistWallet.entity.ts";
import type { UserWalletEntity } from "../../domain/entities/UserWallet.entity.ts";
import type { TransactionEntity } from "../../domain/entities/Transaction.entity.ts";
import {
  WalletModel,
  UserWalletModel,
  TransactionModel,
  type ITransactionDocument
} from "../databases/schema/wallet.schema.ts";
import { PaginationParams, PaginatedResult } from "../../domain/interfaces/pagination.ts";
import { WalletDbMapper } from "../mappers/wallet.db-mapper.ts";

@injectable()
export class WalletRepositoryImpl implements IWalletRepository {
  // --- Therapist Wallet ---
  async findByTherapistId(therapistId: string): Promise<TherapistWalletEntity | null> {
    const doc = await WalletModel.findOne({ therapistId });
    return doc ? WalletDbMapper.toTherapistEntity(doc) : null;
  }

  async createTherapistWallet(wallet: Partial<TherapistWalletEntity>): Promise<TherapistWalletEntity> {
    const doc = await WalletModel.create(wallet);
    return WalletDbMapper.toTherapistEntity(doc);
  }

  async addPendingBalance(therapistId: string, amount: number): Promise<TherapistWalletEntity | null> {
    const doc = await WalletModel.findOneAndUpdate(
      { therapistId },
      { $inc: { pendingBalance: amount } },
      { new: true, upsert: true }
    );
    return doc ? WalletDbMapper.toTherapistEntity(doc) : null;
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
    return doc ? WalletDbMapper.toTherapistEntity(doc) : null;
  }

  // --- User Wallet ---
  async findByUserId(userId: string): Promise<UserWalletEntity | null> {
    const doc = await UserWalletModel.findOne({ userId });
    return doc ? WalletDbMapper.toUserEntity(doc) : null;
  }

  async createUserWallet(wallet: Partial<UserWalletEntity>): Promise<UserWalletEntity> {
    const doc = await UserWalletModel.create(wallet);
    return WalletDbMapper.toUserEntity(doc);
  }

  async addUserBalance(userId: string, amount: number): Promise<UserWalletEntity | null> {
    const doc = await UserWalletModel.findOneAndUpdate(
      { userId },
      { $inc: { balance: amount } },
      { new: true, upsert: true }
    );
    return doc ? WalletDbMapper.toUserEntity(doc) : null;
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
      data: docs.map(doc => WalletDbMapper.toTransactionEntity(doc as unknown as ITransactionDocument)),
      total
    };
  }

  async createTransaction(transaction: Partial<TransactionEntity> & { walletType: string }): Promise<TransactionEntity> {
    const doc = await TransactionModel.create(transaction);
    return WalletDbMapper.toTransactionEntity(doc);
  }

  async updateTransactionStatusByBookingId(bookingId: string, status: "pending" | "completed" | "failed"): Promise<boolean> {
    const res = await TransactionModel.updateMany({ bookingId }, { status });
    return res.matchedCount > 0;
  }

  async findRecentTransactions(limit: number): Promise<TransactionEntity[]> {
    const docs = await TransactionModel.find({}).sort({ createdAt: -1 }).limit(limit).exec();
    return docs.map(doc => WalletDbMapper.toTransactionEntity(doc));
  }

  async findAllTherapistWallets(): Promise<TherapistWalletEntity[]> {
    const docs = await WalletModel.find({}).exec();
    return docs.map(doc => WalletDbMapper.toTherapistEntity(doc));
  }
}
