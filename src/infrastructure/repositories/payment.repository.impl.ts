import type { IPaymentRepository } from "../../domain/repositories/payment.repository.js";
import type { PaymentEntity } from "../../domain/entities/Payment.entity.js";
import { PaymentModel, type IPaymentDocument } from "../databases/schema/payment.schema.js";

export class PaymentRepositoryImpl implements IPaymentRepository {
  private _toEntity(doc: IPaymentDocument): PaymentEntity {
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
      receiptUrl: doc.receiptUrl,
      paidAt: doc.paidAt,
      refundStatus: doc.refundStatus as any,
      refundAmount: doc.refundAmount,
      refundedAt: doc.refundedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async create(payment: Partial<PaymentEntity>): Promise<PaymentEntity> {
    const doc = await PaymentModel.create(payment);
    return this._toEntity(doc);
  }

  async findById(id: string): Promise<PaymentEntity | null> {
    const doc = await PaymentModel.findById(id);
    return doc ? this._toEntity(doc) : null;
  }

  async findByPaymentIntentId(paymentIntentId: string): Promise<PaymentEntity | null> {
    const doc = await PaymentModel.findOne({ paymentIntentId });
    return doc ? this._toEntity(doc) : null;
  }

  async findByBookingId(bookingId: string): Promise<PaymentEntity | null> {
    const doc = await PaymentModel.findOne({ bookingId, status: "paid" });
    return doc ? this._toEntity(doc) : null;
  }

  async updateStatus(id: string, status: PaymentEntity["status"], extra?: Partial<PaymentEntity>): Promise<PaymentEntity | null> {
    const doc = await PaymentModel.findByIdAndUpdate(
      id,
      { status, ...extra },
      { new: true }
    );
    return doc ? this._toEntity(doc) : null;
  }
}
