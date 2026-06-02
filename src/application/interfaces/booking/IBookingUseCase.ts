import type { BookingEntity } from "../../../domain/entities/Booking.entity.ts";
import type { IUseCase } from "../IUseCase.ts";
import type { PaginationParams, PaginatedResult } from "../../../domain/interfaces/pagination.ts";

export interface CreateBookingInput {
  therapistId: string;
  slotId: string;
  type: "video" | "chat" | "in-person";
  note?: string;
}

export type ICreateBookingUseCase = IUseCase<{ userId: string; data: CreateBookingInput }, BookingEntity>;

export type IGetUserBookingsUseCase = IUseCase<{ userId: string; params: PaginationParams }, PaginatedResult<BookingEntity>>;

export type IGetTherapistBookingsUseCase = IUseCase<{ therapistId: string; params: PaginationParams }, PaginatedResult<BookingEntity>>;

export type IUpdateBookingStatusUseCase = IUseCase<{ id: string; status: BookingEntity["status"]; rejectionReason?: string }, BookingEntity | null>;

export interface CancelBookingInput {
  bookingId: string;
  cancelledBy: "user" | "therapist";
  userIdOrTherapistId: string;
  reason: string;
}

export type ICancelBookingUseCase = IUseCase<CancelBookingInput, BookingEntity>;
