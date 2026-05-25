import type { IBookingRepository } from "../../../domain/repositories/booking.repository.ts";
import type { ISlotRepository } from "../../../domain/repositories/availability.repository.ts";
import type { BookingEntity } from "../../../domain/entities/Booking.entity.ts";
import type { ICreateBookingUseCase } from "../../interfaces/booking/IBookingUseCase.ts";

export interface CreateBookingInput {
  therapistId: string;
  slotId: string;
  type: "video" | "chat" | "in-person";
  note?: string;
}

export class CreateBookingUseCase implements ICreateBookingUseCase {
  constructor(
    private bookingRepository: IBookingRepository,
    private slotRepository: ISlotRepository
  ) { }

  async execute({ userId, data }: { userId: string; data: CreateBookingInput }): Promise<BookingEntity> {

    const slot = await this.slotRepository.findById(data.slotId);

    if (!slot) {
      throw new Error("The selected slot does not exist");
    }

    if (slot.status !== "AVAILABLE") {
      throw new Error("This slot is no longer available for booking");
    }

    await this.slotRepository.updateStatus(data.slotId, "RESERVED");

    try {
      const booking = await this.bookingRepository.create({
        userId,
        therapistId: data.therapistId,
        slotId: data.slotId,
        type: data.type,
        status: "pending",
        note: data.note,
      });
      return booking;
    } catch (err) {

      await this.slotRepository.updateStatus(data.slotId, "AVAILABLE");
      throw err;
    }
  }
}
