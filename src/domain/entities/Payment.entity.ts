import type { PaymentStatus } from "../../shared/constants/index.js";

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
  receiptUrl?: string;
  paidAt?: Date;
  refundStatus?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
