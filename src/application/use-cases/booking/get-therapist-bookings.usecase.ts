import { inject, injectable } from "inversify";
import { BookingEntity } from "../../../domain/entities/Booking.entity";
import { PaginatedResult, PaginationParams } from "../../../domain/interfaces/pagination";
import type { IBookingRepository } from "../../../domain/repositories/booking.repository";
import { IGetTherapistBookingsUseCase } from "../../interfaces/booking/IBookingUseCase";
import { TYPES } from "../../../shared/constants/tokens";

@injectable()
export class GetTherapistBookingsUseCase implements IGetTherapistBookingsUseCase {
  constructor(
    @inject(TYPES.BookingRepository) private readonly _bookingRepository: IBookingRepository
  ) { }
  async execute({ therapistId, params }: { therapistId: string; params: PaginationParams }): Promise<PaginatedResult<BookingEntity>> {
    return await this._bookingRepository.findByTherapistId(therapistId, params);
  }
}
