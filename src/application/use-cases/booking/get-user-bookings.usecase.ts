import type { IBookingRepository } from "../../../domain/repositories/booking.repository.ts";
import type { BookingEntity } from "../../../domain/entities/Booking.entity.ts";
import type { IGetUserBookingsUseCase } from "../../interfaces/booking/IBookingUseCase.ts";

import type { PaginationParams, PaginatedResult } from "../../../domain/interfaces/pagination.ts";
import { injectable,inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";


@injectable()
export class GetUserBookingsUseCase implements IGetUserBookingsUseCase {
  constructor(
    @inject(TYPES.BookingRepository)private readonly _bookingRepository: IBookingRepository
  ) {}
  async execute({ userId, params }: { userId: string; params: PaginationParams }): Promise<PaginatedResult<BookingEntity>> {
    return await this._bookingRepository.findByUserId(userId, params);
  }
}

