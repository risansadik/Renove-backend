import type { BookingEntity } from "../entities/Booking.entity.js";
import { PaginationParams, PaginatedResult } from "./pagination.js";

export interface IBookingRepository {
  create(booking: Omit<BookingEntity, "id" | "createdAt" | "updatedAt">): Promise<BookingEntity>;
  findById(id: string): Promise<BookingEntity | null>;
  findByUserId(userId: string, params?: PaginationParams): Promise<PaginatedResult<BookingEntity>>;
  findByTherapistId(therapistId: string, params?: PaginationParams): Promise<PaginatedResult<BookingEntity>>;
  updateStatus(id: string, status: BookingEntity["status"], rejectionReason?: string): Promise<BookingEntity | null>;
  checkAvailability(therapistId: string, date: Date, slot: string): Promise<boolean>;
}
