import type { BookingEntity } from "../../../domain/entities/Booking.entity.js";
import type { CreateBookingInput } from "../../use-cases/booking/create-booking.usecase.js";
import type { IUseCase } from "../IUseCase.js";

export interface ICreateBookingUseCase extends IUseCase<{ userId: string; data: CreateBookingInput }, BookingEntity> {}

export interface IGetUserBookingsUseCase extends IUseCase<string, BookingEntity[]> {}

export interface IGetTherapistBookingsUseCase extends IUseCase<string, BookingEntity[]> {}

export interface IUpdateBookingStatusUseCase extends IUseCase<{ id: string; status: BookingEntity["status"]; rejectionReason?: string }, BookingEntity | null> {}
