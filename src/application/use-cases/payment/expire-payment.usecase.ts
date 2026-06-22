import { subMinutes } from "date-fns";
import type { ISlotRepository } from "../../../domain/repositories/availability.repository";
import type { IBookingRepository } from "../../../domain/repositories/booking.repository";
import type { IPaymentRepository } from "../../../domain/repositories/payment.repository";
import { BOOKING_STATUS, SLOT_STATUS, PAYMENT_EXPIRY_MINUTES } from "../../../shared/constants/index";
import { IExpirePaymentUseCase } from "../../interfaces/payment/IPaymentUseCase";
import { injectable,inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens";
import type { ILogger } from "../../interfaces/services/ILoggerService";

@injectable()
export class ExpirePaymentUseCase implements IExpirePaymentUseCase{
  constructor(
    @inject(TYPES.BookingRepository)private readonly _bookingRepo: IBookingRepository,
    @inject(TYPES.SlotRepository)private readonly _slotRepo: ISlotRepository,
    @inject(TYPES.PaymentRepository)private readonly _paymentRepo: IPaymentRepository,
    @inject(TYPES.Logger) private readonly _logger: ILogger
  ) {}

  async execute(): Promise<void> {
    const expirationThreshold = subMinutes(new Date(), PAYMENT_EXPIRY_MINUTES);
    const overdueBookings = await this._bookingRepo.findAwaitingPaymentOlderThan(expirationThreshold);

    if (overdueBookings.length === 0) return;

    this._logger.info(`Found ${overdueBookings.length} overdue payments to expire.`);

    const expirationJobs = overdueBookings
      .filter((booking) => Boolean(booking.id))
      .map(async (booking) => {
        const bookingId = booking.id!;
        await this._bookingRepo.updateStatus(bookingId, BOOKING_STATUS.EXPIRED);

        const slotId = typeof booking.slotId === "object" && booking.slotId !== null
          ? (booking.slotId as {id : string}).id
          : (booking.slotId as string);
        await this._slotRepo.updateStatus(slotId, SLOT_STATUS.AVAILABLE);

        await this._paymentRepo.failUnpaidByBookingId(bookingId);

        this._logger.info(`Expired booking ${bookingId} and released slot ${slotId}`);
      });

    const results = await Promise.allSettled(expirationJobs);
    results
      .filter((result) => result.status === "rejected")
      .forEach((result) => this._logger.error("Failed to expire booking", { error: result.reason }));
  }
}
