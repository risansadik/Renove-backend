import { BookingModel } from "../../../infrastructure/databases/schema/booking.schema.ts";
import { SlotModel } from "../../../infrastructure/databases/schema/availability.schema.ts";
import { PaymentModel } from "../../../infrastructure/databases/schema/payment.schema.ts";
import { BOOKING_STATUS, SLOT_STATUS, PAYMENT_STATUS } from "../../../shared/constants/index.ts";
import { logger } from "../../../shared/utils/logger.ts";
import { subMinutes } from "date-fns";

export class ExpirePaymentUseCase {
  /**
   * Identifies and expires bookings that have been in AWAITING_PAYMENT for too long.
   * Runs as a background task.
   */
  async execute() {
    const expirationThreshold = subMinutes(new Date(), 15);

    // Find bookings that are awaiting payment and haven't been updated for 15 minutes
    const overdueBookings = await BookingModel.find({
      status: BOOKING_STATUS.AWAITING_PAYMENT,
      updatedAt: { $lt: expirationThreshold }
    });

    if (overdueBookings.length === 0) return;

    logger.info(`Found ${overdueBookings.length} overdue payments to expire.`);

    for (const booking of overdueBookings) {
      try {
        // 1. Expire Booking
        booking.status = BOOKING_STATUS.EXPIRED as "expired";
        await booking.save();

        // 2. Release Slot
        await SlotModel.findByIdAndUpdate(booking.slotId, {
          status: SLOT_STATUS.AVAILABLE
        });

        // 3. Mark associated Payment as FAILED if it exists and is unpaid
        await PaymentModel.updateMany(
          { bookingId: booking._id, status: PAYMENT_STATUS.UNPAID },
          { status: PAYMENT_STATUS.FAILED as "failed" }
        );

        logger.info(`Expired booking ${booking._id} and released slot ${booking.slotId}`);
      } catch (error) {
        logger.error(`Failed to expire booking ${booking._id}`, { error });
      }
    }
  }
}
