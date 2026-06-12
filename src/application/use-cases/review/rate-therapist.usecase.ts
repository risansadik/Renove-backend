import { inject, injectable } from "inversify";
import type { IBookingRepository } from "../../../domain/repositories/booking.repository.ts";
import type { ITherapistReviewRepository } from "../../../domain/repositories/therapist-review.repository.ts";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.ts";
import { HttpStatus } from "../../../shared/constants/index.ts";
import { TYPES } from "../../../shared/constants/tokens.ts";
import { AppError, NotFoundError } from "../../../shared/utils/AppError.ts";
import type { IRateTherapistUseCase } from "../../interfaces/review/IReviewUseCase.ts";

@injectable()
export class RateTherapistUseCase implements IRateTherapistUseCase {
  constructor(
    @inject(TYPES.BookingRepository) private readonly _bookingRepo: IBookingRepository,
    @inject(TYPES.TherapistRepository) private readonly _therapistRepo: ITherapistRepository,
    @inject(TYPES.TherapistReviewRepository) private readonly _reviewRepo: ITherapistReviewRepository
  ) {}

  async execute({ userId, therapistId, rating }: { userId: string; therapistId: string; rating: number }) {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new AppError("Rating must be between 1 and 5", HttpStatus.BAD_REQUEST);
    }

    const therapist = await this._therapistRepo.findById(therapistId);
    if (!therapist) throw new NotFoundError("Therapist");

    const canReview = await this._bookingRepo.hasUserCompletedSessionWithTherapist(userId, therapistId);
    if (!canReview) {
      throw new AppError("You can rate this therapist after attending at least one completed session", HttpStatus.FORBIDDEN);
    }

    const review = await this._reviewRepo.upsert({ userId, therapistId, rating });
    const summary = await this._reviewRepo.getRatingSummary(therapistId);
    await this._therapistRepo.updateRatingSummary(therapistId, summary);

    return {
      ...summary,
      userRating: review.rating,
    };
  }
}
