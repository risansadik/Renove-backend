import type { PaymentStatus } from "../../shared/constants/index";

export interface PaymentEntity {
  id?: string;
  bookingId: string;
  userId: string;
  therapistId: string;
  provider: "stripe";
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  consultationFee?: number;
  commissionPercentage?: number;
  platformFee?: number;
  receiptUrl?: string;
  paidAt?: Date;
  refundStatus?: "none" | "pending" | "processed" | "failed" | "partial";
  refundAmount?: number;
  refundedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

