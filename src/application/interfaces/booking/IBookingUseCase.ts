import type { BookingEntity } from "../../../domain/entities/Booking.entity.js";
import type { CreateBookingInput } from "../../use-cases/booking/create-booking.usecase.js";
import type { IUseCase } from "../IUseCase.js";

export type ICreateBookingUseCase = IUseCase<{ userId: string; data: CreateBookingInput }, BookingEntity>;

export type IGetUserBookingsUseCase = IUseCase<string, BookingEntity[]>;

export type IGetTherapistBookingsUseCase = IUseCase<string, BookingEntity[]>;

export type IUpdateBookingStatusUseCase = IUseCase<{ id: string; status: BookingEntity["status"]; rejectionReason?: string }, BookingEntity | null>;
