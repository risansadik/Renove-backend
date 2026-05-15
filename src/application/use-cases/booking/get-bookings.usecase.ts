import type { IBookingRepository } from "../../../domain/repositories/booking.repository.js";
import type { BookingEntity } from "../../../domain/entities/Booking.entity.js";

export class GetUserBookingsUseCase {
  constructor(private bookingRepository: IBookingRepository) {}
  async execute(userId: string): Promise<BookingEntity[]> {
    return await this.bookingRepository.findByUserId(userId);
  }
}

export class GetTherapistBookingsUseCase {
  constructor(private bookingRepository: IBookingRepository) {}
  async execute(therapistId: string): Promise<BookingEntity[]> {
    return await this.bookingRepository.findByTherapistId(therapistId);
  }
}

export class UpdateBookingStatusUseCase {
  constructor(private bookingRepository: IBookingRepository) {}
  async execute(id: string, status: BookingEntity["status"], rejectionReason?: string): Promise<BookingEntity | null> {
    return await this.bookingRepository.updateStatus(id, status, rejectionReason);
  }
}
