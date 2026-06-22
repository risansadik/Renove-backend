import type { TherapistWalletEntity } from "../entities/TherapistWallet.entity";
import type { UserWalletEntity } from "../entities/UserWallet.entity";
import type { TransactionEntity } from "../entities/Transaction.entity";
import { PaginationParams, PaginatedResult } from "../interfaces/pagination";

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
  updateTransactionStatusByBookingId(bookingId: string, status: "pending" | "completed" | "failed"): Promise<boolean>;
  findRecentTransactions(limit: number): Promise<TransactionEntity[]>;
  findAllTherapistWallets(): Promise<TherapistWalletEntity[]>;
}
