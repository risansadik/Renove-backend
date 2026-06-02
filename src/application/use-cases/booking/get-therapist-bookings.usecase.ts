import { inject, injectable } from "inversify";
import { BookingEntity } from "../../../domain/entities/Booking.entity.ts";
import { PaginatedResult, PaginationParams } from "../../../domain/interfaces/pagination.ts";
import { IBookingRepository } from "../../../domain/repositories/booking.repository.ts";
import { IGetTherapistBookingsUseCase } from "../../interfaces/booking/IBookingUseCase.ts";
import { TYPES } from "../../../shared/constants/tokens.ts";

@injectable()
export class GetTherapistBookingsUseCase implements IGetTherapistBookingsUseCase {
  constructor(
    @inject(TYPES.BookingRepository) private readonly _bookingRepository: IBookingRepository
  ) { }
  async execute({ therapistId, params }: { therapistId: string; params: PaginationParams }): Promise<PaginatedResult<BookingEntity>> {
    return await this._bookingRepository.findByTherapistId(therapistId, params);
  }
}
