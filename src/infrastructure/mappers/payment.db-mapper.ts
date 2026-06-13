import type { IPaymentDocument } from "../databases/schema/payment.schema.ts";
import type { PaymentEntity } from "../../domain/entities/Payment.entity.ts";

export class PaymentDbMapper {
  static toEntity(doc: IPaymentDocument): PaymentEntity {
    return {
      id: doc._id.toString(),
      bookingId: doc.bookingId.toString(),
      userId: doc.userId.toString(),
      therapistId: doc.therapistId.toString(),
      provider: doc.provider as "stripe",
      paymentIntentId: doc.paymentIntentId,
      amount: doc.amount,
      currency: doc.currency,
      status: doc.status,
      consultationFee: doc.consultationFee,
      commissionPercentage: doc.commissionPercentage,
      platformFee: doc.platformFee,
      receiptUrl: doc.receiptUrl,
      paidAt: doc.paidAt,
      refundStatus: doc.refundStatus as "none" | "pending" | "processed" | "failed" | "partial",
      refundAmount: doc.refundAmount,
      refundedAt: doc.refundedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
