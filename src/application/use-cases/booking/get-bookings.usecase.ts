import type { IBookingRepository } from "../../../domain/repositories/booking.repository.js";
import type { BookingEntity } from "../../../domain/entities/Booking.entity.js";
import type { IGetUserBookingsUseCase, IGetTherapistBookingsUseCase, IUpdateBookingStatusUseCase } from "../../interfaces/booking/IBookingUseCase.js";

export class GetUserBookingsUseCase implements IGetUserBookingsUseCase {
  constructor(private bookingRepository: IBookingRepository) {}
  async execute(userId: string): Promise<BookingEntity[]> {
    return await this.bookingRepository.findByUserId(userId);
  }
}

export class GetTherapistBookingsUseCase implements IGetTherapistBookingsUseCase {
  constructor(private bookingRepository: IBookingRepository) {}
  async execute(therapistId: string): Promise<BookingEntity[]> {
    return await this.bookingRepository.findByTherapistId(therapistId);
  }
}

export class UpdateBookingStatusUseCase implements IUpdateBookingStatusUseCase {
  constructor(private bookingRepository: IBookingRepository) {}
  async execute({ id, status, rejectionReason }: { id: string; status: BookingEntity["status"]; rejectionReason?: string }): Promise<BookingEntity | null> {
    return await this.bookingRepository.updateStatus(id, status, rejectionReason);
  }
}
