export interface TransactionEntity {
  id?: string;
  walletId: string;
  amount: number;
  type: "credit" | "debit";
  description: string;
  status: "pending" | "completed" | "failed";
  bookingId?: string;
  consultationFee?: number;
  commissionPercentage?: number;
  platformFee?: number;
  totalPaid?: number;
  therapistEarnings?: number;
  refundAmount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

