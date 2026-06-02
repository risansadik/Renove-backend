import type { TransactionEntity } from "../entities/Transaction.entity.ts";

export interface AdminFinanceStats {
  totalRevenue: number;
  totalTherapistEarnings: number;
  totalPendingPayouts: number;
  totalWithdrawn: number;
  totalRefunded: number;
  transactions: TransactionEntity[];
}

export interface IFinanceRepository {
  getAdminFinanceStats(): Promise<AdminFinanceStats>;
}
