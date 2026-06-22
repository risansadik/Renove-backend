import type { IBookingRepository } from "../../../domain/repositories/booking.repository";
import type { ISlotRepository } from "../../../domain/repositories/availability.repository";
import type { INotificationService } from "../../interfaces/services/INotificationService";
import type { BookingEntity } from "../../../domain/entities/Booking.entity";
import type { CreateBookingInput, ICreateBookingUseCase } from "../../interfaces/booking/IBookingUseCase";
import { HttpStatus } from "../../../shared/constants/index";
import { AppError, NotFoundError } from "../../../shared/utils/AppError";
import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens";


@injectable()
export class CreateBookingUseCase implements ICreateBookingUseCase {
  constructor(
    @inject(TYPES.BookingRepository) private readonly _bookingRepository: IBookingRepository,
    @inject(TYPES.SlotRepository) private readonly _slotRepository: ISlotRepository,
    @inject(TYPES.NotificationService) private readonly _notificationService: INotificationService
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

    const booking = await this._bookingRepository.create({
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

    await this._notificationService.createAndEmit({
      recipientId: data.therapistId,
      recipientRole: "therapist",
      type: "booking_request",
      title: "New Booking Request",
      message: "You have received a new session booking request awaiting your confirmation.",
      bookingId: booking.id,
    });

    return booking;
  }
}
