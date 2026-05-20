import type { PaymentEntity } from "../entities/Payment.entity.js";

export interface IPaymentRepository {
  create(payment: Partial<PaymentEntity>): Promise<PaymentEntity>;
  findById(id: string): Promise<PaymentEntity | null>;
  findByPaymentIntentId(paymentIntentId: string): Promise<PaymentEntity | null>;
  findByBookingId(bookingId: string): Promise<PaymentEntity | null>;
  updateStatus(id: string, status: PaymentEntity["status"], extra?: Partial<PaymentEntity>): Promise<PaymentEntity | null>;
}
