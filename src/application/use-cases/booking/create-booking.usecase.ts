import type { IBookingRepository } from "../../../domain/repositories/booking.repository.js";
import type { ISlotRepository } from "../../../domain/repositories/availability.repository.js";
import type { BookingEntity } from "../../../domain/entities/Booking.entity.js";
import type { ICreateBookingUseCase } from "../../interfaces/booking/IBookingUseCase.js";

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
  ) {}

  async execute({ userId, data }: { userId: string; data: CreateBookingInput }): Promise<BookingEntity> {
    // 1. Check if slot exists and is AVAILABLE
    const slot = await this.slotRepository.findById(data.slotId);
    
    if (!slot) {
      throw new Error("The selected slot does not exist");
    }

    if (slot.status !== "AVAILABLE") {
      throw new Error("This slot is no longer available for booking");
    }

    // 2. Reserve the slot (atomic update would be better in prod, but this follows current patterns)
    await this.slotRepository.updateStatus(data.slotId, "RESERVED");

    // 3. Create the booking
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
      // Rollback slot if booking fails
      await this.slotRepository.updateStatus(data.slotId, "AVAILABLE");
      throw err;
    }
  }
}
