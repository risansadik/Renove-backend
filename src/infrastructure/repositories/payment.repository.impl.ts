import { injectable } from "inversify";
import type { IPaymentRepository } from "../../domain/repositories/payment.repository";
import type { PaymentEntity } from "../../domain/entities/Payment.entity";
import { PaymentModel } from "../databases/schema/payment.schema";
import { PaymentDbMapper } from "../mappers/payment.db-mapper";

@injectable()
export class PaymentRepositoryImpl implements IPaymentRepository {
  async create(payment: Partial<PaymentEntity>): Promise<PaymentEntity> {
    const doc = await PaymentModel.create(payment);
    return PaymentDbMapper.toEntity(doc);
  }

  async findById(id: string): Promise<PaymentEntity | null> {
    const doc = await PaymentModel.findById(id);
    return doc ? PaymentDbMapper.toEntity(doc) : null;
  }

  async findByPaymentIntentId(paymentIntentId: string): Promise<PaymentEntity | null> {
    const doc = await PaymentModel.findOne({ paymentIntentId });
    return doc ? PaymentDbMapper.toEntity(doc) : null;
  }

  async findByBookingId(bookingId: string): Promise<PaymentEntity | null> {
    const doc = await PaymentModel.findOne({ bookingId, status: "paid" }).sort({ createdAt: -1 });
    return doc ? PaymentDbMapper.toEntity(doc) : null;
  }

  async findAnyByBookingId(bookingId: string): Promise<PaymentEntity | null> {
    const doc = await PaymentModel.findOne({ bookingId }).sort({ createdAt: -1 });
    return doc ? PaymentDbMapper.toEntity(doc) : null;
  }

  async updateStatus(id: string, status: PaymentEntity["status"], extra?: Partial<PaymentEntity>): Promise<PaymentEntity | null> {
    const doc = await PaymentModel.findByIdAndUpdate(
      id,
      { status, ...extra },
      { new: true }
    );
    return doc ? PaymentDbMapper.toEntity(doc) : null;
  }

  async failUnpaidByBookingId(bookingId: string): Promise<void> {
    await PaymentModel.updateMany({ bookingId, status: "unpaid" }, { status: "failed" });
  }
}
