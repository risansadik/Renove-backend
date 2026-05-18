import type { TherapistWalletEntity } from "../entities/TherapistWallet.entity.js";
import type { UserWalletEntity } from "../entities/UserWallet.entity.js";
import type { TransactionEntity } from "../entities/Transaction.entity.js";
import { PaginationParams, PaginatedResult } from "./pagination.js";

export interface IWalletRepository {
  // Therapist Wallet
  findByTherapistId(therapistId: string): Promise<TherapistWalletEntity | null>;
  createTherapistWallet(wallet: Partial<TherapistWalletEntity>): Promise<TherapistWalletEntity>;
  addPendingBalance(therapistId: string, amount: number): Promise<TherapistWalletEntity | null>;
  movePendingToAvailable(therapistId: string, amount: number): Promise<TherapistWalletEntity | null>;

  // User Wallet
  findByUserId(userId: string): Promise<UserWalletEntity | null>;
  createUserWallet(wallet: Partial<UserWalletEntity>): Promise<UserWalletEntity>;
  addUserBalance(userId: string, amount: number): Promise<UserWalletEntity | null>;

  // Transactions
  getTransactions(walletId: string, walletType: "TherapistWallet" | "UserWallet", params?: PaginationParams): Promise<PaginatedResult<TransactionEntity>>;
  createTransaction(transaction: Partial<TransactionEntity> & { walletType: string }): Promise<TransactionEntity>;
}
