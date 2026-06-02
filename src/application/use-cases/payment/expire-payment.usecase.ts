import { subMinutes } from "date-fns";
import type { ISlotRepository } from "../../../domain/repositories/availability.repository.ts";
import type { IBookingRepository } from "../../../domain/repositories/booking.repository.ts";
import type { IPaymentRepository } from "../../../domain/repositories/payment.repository.ts";
import { BOOKING_STATUS, SLOT_STATUS, PAYMENT_EXPIRY_MINUTES } from "../../../shared/constants/index.ts";
import { logger } from "../../../shared/utils/logger.ts";

export class ExpirePaymentUseCase {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _slotRepo: ISlotRepository,
    private readonly _paymentRepo: IPaymentRepository
  ) {}

  async execute(): Promise<void> {
    const expirationThreshold = subMinutes(new Date(), PAYMENT_EXPIRY_MINUTES);
    const overdueBookings = await this._bookingRepo.findAwaitingPaymentOlderThan(expirationThreshold);

    if (overdueBookings.length === 0) return;

    logger.info(`Found ${overdueBookings.length} overdue payments to expire.`);

    const expirationJobs = overdueBookings
      .filter((booking) => Boolean(booking.id))
      .map(async (booking) => {
        const bookingId = booking.id!;
        await this._bookingRepo.updateStatus(bookingId, BOOKING_STATUS.EXPIRED);

        const slotId = typeof booking.slotId === "object" && booking.slotId !== null
          ? booking.slotId.id
          : booking.slotId;
        await this._slotRepo.updateStatus(slotId, SLOT_STATUS.AVAILABLE);

        await this._paymentRepo.failUnpaidByBookingId(bookingId);

        logger.info(`Expired booking ${bookingId} and released slot ${slotId}`);
      });

    const results = await Promise.allSettled(expirationJobs);
    results
      .filter((result) => result.status === "rejected")
      .forEach((result) => logger.error("Failed to expire booking", { error: result.reason }));
  }
}
