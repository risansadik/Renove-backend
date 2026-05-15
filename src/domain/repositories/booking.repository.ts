import type { BookingEntity } from "../entities/Booking.entity.js";

export interface IBookingRepository {
  create(booking: Omit<BookingEntity, "id" | "createdAt" | "updatedAt">): Promise<BookingEntity>;
  findById(id: string): Promise<BookingEntity | null>;
  findByUserId(userId: string): Promise<BookingEntity[]>;
  findByTherapistId(therapistId: string): Promise<BookingEntity[]>;
  updateStatus(id: string, status: BookingEntity["status"], rejectionReason?: string): Promise<BookingEntity | null>;
  checkAvailability(therapistId: string, date: Date, slot: string): Promise<boolean>;
}
