import type { BookingEntity } from "../../../domain/entities/Booking.entity.js";
import type { CreateBookingInput } from "../../use-cases/booking/create-booking.usecase.js";
import type { IUseCase } from "../IUseCase.js";
import type { PaginationParams, PaginatedResult } from "../../../domain/interfaces/pagination.js";

export type ICreateBookingUseCase = IUseCase<{ userId: string; data: CreateBookingInput }, BookingEntity>;

export type IGetUserBookingsUseCase = IUseCase<{ userId: string; params: PaginationParams }, PaginatedResult<BookingEntity>>;

export type IGetTherapistBookingsUseCase = IUseCase<{ therapistId: string; params: PaginationParams }, PaginatedResult<BookingEntity>>;

export type IUpdateBookingStatusUseCase = IUseCase<{ id: string; status: BookingEntity["status"]; rejectionReason?: string }, BookingEntity | null>;
