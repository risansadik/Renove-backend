import type { IBookingRepository } from "../../../domain/repositories/booking.repository.ts";
import type { ISlotRepository } from "../../../domain/repositories/availability.repository.ts";
import type { BookingEntity } from "../../../domain/entities/Booking.entity.ts";
import type { CreateBookingInput, ICreateBookingUseCase } from "../../interfaces/booking/IBookingUseCase.ts";
import { HttpStatus } from "../../../shared/constants/index.ts";
import { AppError, NotFoundError } from "../../../shared/utils/AppError.ts";
import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";


@injectable()
export class CreateBookingUseCase implements ICreateBookingUseCase {
  constructor(
    @inject(TYPES.BookingRepository) private readonly _bookingRepository: IBookingRepository,
    @inject(TYPES.SlotRepository) private readonly _slotRepository: ISlotRepository
  ) { }

  async execute({ userId, data }: { userId: string; data: CreateBookingInput }): Promise<BookingEntity> {

    const slot = await this._slotRepository.findById(data.slotId);

    if (!slot) {
      throw new NotFoundError("The selected slot");
    }

    if (slot.status !== "AVAILABLE") {
      throw new AppError("This slot is no longer available for booking", HttpStatus.BAD_REQUEST);
    }

    await this._slotRepository.updateStatus(data.slotId, "RESERVED");

    return this._bookingRepository.create({
      userId,
      therapistId: data.therapistId,
      slotId: data.slotId,
      type: data.type,
      status: "pending",
      note: data.note,
    }).catch(async (err) => {
      await this._slotRepository.updateStatus(data.slotId, "AVAILABLE");
      throw err;
    });
  }
}
