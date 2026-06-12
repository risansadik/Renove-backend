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
  hasUserCompletedSessionWithTherapist(userId: string, therapistId: string): Promise<boolean>;
  findAwaitingPaymentOlderThan(threshold: Date): Promise<BookingEntity[]>;
  countAll(): Promise<number>;
  countBySlotStartTimeBetween(start: Date, end: Date): Promise<number>;
  countByStatuses(statuses: BookingStatus[]): Promise<number>;
  findRecentBookings(limit: number): Promise<BookingEntity[]>;
  getTopTherapists(limit: number): Promise<Array<{ therapistId: string; name: string; completedSessions: number; averageRating: number; totalRatings: number }>>;
  findBookingsCreatedAfter(date: Date): Promise<BookingEntity[]>;
  getStatusDistribution(): Promise<Array<{ status: string; count: number }>>;
}
