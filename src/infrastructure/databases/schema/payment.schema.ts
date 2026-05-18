import mongoose, { Schema, type Document } from "mongoose";
import type { PaymentStatus } from "../../../shared/constants/index.js";

export interface IPaymentDocument extends Document {
  bookingId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  therapistId: mongoose.Types.ObjectId;
  provider: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  receiptUrl?: string;
  paidAt?: Date;
  refundStatus?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPaymentDocument>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    therapistId: { type: Schema.Types.ObjectId, ref: "Therapist", required: true },
    provider: { type: String, default: "stripe", required: true },
    paymentIntentId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "usd", required: true },
    status: { 
      type: String, 
      enum: ["unpaid", "pending", "paid", "failed", "refunded"], 
      default: "unpaid",
      required: true 
    },
    receiptUrl: { type: String },
    paidAt: { type: Date },
    refundStatus: { type: String },
  },
  { timestamps: true }
);

// Indexes for faster lookups
PaymentSchema.index({ bookingId: 1 });
PaymentSchema.index({ paymentIntentId: 1 });
PaymentSchema.index({ userId: 1 });
PaymentSchema.index({ therapistId: 1 });

export const PaymentModel = mongoose.model<IPaymentDocument>("Payment", PaymentSchema);
