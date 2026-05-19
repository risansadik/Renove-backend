import { StripeHelper } from "../../../shared/utils/stripe.js";
import type { IPaymentRepository } from "../../../domain/repositories/payment.repository.js";
import type { IBookingRepository } from "../../../domain/repositories/booking.repository.js";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.js";
import type { ISettingsRepository } from "../../../domain/repositories/settings.repository.js";
import { BOOKING_STATUS, PAYMENT_STATUS, HttpStatus } from "../../../shared/constants/index.js";
import { AppError } from "../../../shared/utils/AppError.js";

export class CreatePaymentIntentUseCase {
  constructor(
    private _paymentRepo: IPaymentRepository,
    private _bookingRepo: IBookingRepository,
    private _therapistRepo: ITherapistRepository,
    private _settingsRepo: ISettingsRepository
  ) { }

  async execute(bookingId: string, userId: string) {
    const booking = await this._bookingRepo.findById(bookingId);

    if (!booking) {
      throw new AppError("Booking not found", HttpStatus.NOT_FOUND);
    }

    // Security check: ensure the booking belongs to the requesting user
    const bookingUserId = typeof booking.userId === 'object' && booking.userId !== null ? (booking.userId as { id: string }).id : booking.userId as string;
    if (bookingUserId !== userId) {
      throw new AppError("Unauthorized access to booking", HttpStatus.FORBIDDEN);
    }

    if (booking.status !== BOOKING_STATUS.AWAITING_PAYMENT) {
      throw new AppError(`Payment can only be made for bookings in AWAITING_PAYMENT status. Current status: ${booking.status}`, HttpStatus.BAD_REQUEST);
    }

    const therapistId = typeof booking.therapistId === 'object' && booking.therapistId !== null ? (booking.therapistId as { id: string }).id : booking.therapistId as string;
    const therapist = await this._therapistRepo.findById(therapistId);

    if (!therapist) {
      throw new AppError("Therapist not found", HttpStatus.NOT_FOUND);
    }

    if (!therapist.consultationFee || therapist.consultationFee <= 0) {
      throw new AppError("Therapist consultation fee is not set", HttpStatus.BAD_REQUEST);
    }

    // Retrieve active platform commission percentage and calculate splits
    const commissionPercentage = await this._settingsRepo.getCommissionPercentage();
    const consultationFee = therapist.consultationFee;
    const platformFee = Math.round(consultationFee * (commissionPercentage / 100) * 100) / 100;
    const totalPaid = consultationFee + platformFee;

    // Stripe expects amount in cents
    const amountInCents = Math.round(totalPaid * 100);

    // Create Payment Intent with Stripe
    const paymentIntent = await StripeHelper.createPaymentIntent(amountInCents, {
      bookingId,
      userId,
      therapistId,
    });

    // Create local payment record tracking the intent
    await this._paymentRepo.create({
      bookingId,
      userId,
      therapistId,
      paymentIntentId: paymentIntent.id,
      amount: totalPaid,
      consultationFee,
      commissionPercentage,
      platformFee,
      currency: "usd",
      status: PAYMENT_STATUS.UNPAID,
      provider: "stripe",
    });

    return {
      clientSecret: paymentIntent.client_secret,
      amount: totalPaid,
      consultationFee,
      commissionPercentage,
      platformFee,
    };
  }
}

