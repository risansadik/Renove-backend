import type { BookingEntity } from "../entities/Booking.entity.ts";
import type { BookingStatus } from "../../shared/constants/index.ts";
import { PaginationParams, PaginatedResult } from "../interfaces/pagination.ts";

export interface IBookingRepository {
  create(booking: Omit<BookingEntity, "id" | "createdAt" | "updatedAt">): Promise<BookingEntity>;
  findById(id: string): Promise<BookingEntity | null>;
  findByUserId(userId: string, params?: PaginationParams): Promise<PaginatedResult<BookingEntity>>;
  findByTherapistId(therapistId: string, params?: PaginationParams): Promise<PaginatedResult<BookingEntity>>;
  updateStatus(id: string, status: BookingEntity["status"], rejectionReason?: string): Promise<BookingEntity | null>;
  update(id: string, data: Partial<BookingEntity>): Promise<BookingEntity | null>;
  checkAvailability(therapistId: string, date: Date, slot: string): Promise<boolean>;
  countByUserAndStatus(userId: string, status: BookingStatus): Promise<number>;
  countByTherapistAndStatusBetween(therapistId: string, status: BookingStatus, start: Date, end: Date): Promise<number>;
  findAwaitingPaymentOlderThan(threshold: Date): Promise<BookingEntity[]>;
}
