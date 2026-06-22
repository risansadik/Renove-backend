import type { IBookingRepository } from "../../../domain/repositories/booking.repository";
import type { BookingEntity } from "../../../domain/entities/Booking.entity";
import type { IGetUserBookingsUseCase } from "../../interfaces/booking/IBookingUseCase";

import type { PaginationParams, PaginatedResult } from "../../../domain/interfaces/pagination";
import { injectable,inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens";


@injectable()
export class GetUserBookingsUseCase implements IGetUserBookingsUseCase {
  constructor(
    @inject(TYPES.BookingRepository)private readonly _bookingRepository: IBookingRepository
  ) {}
  async execute({ userId, params }: { userId: string; params: PaginationParams }): Promise<PaginatedResult<BookingEntity>> {
    return await this._bookingRepository.findByUserId(userId, params);
  }
}

