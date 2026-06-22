import { inject, injectable } from "inversify";
import type { IBookingRepository } from "../../../domain/repositories/booking.repository";
import type { ITherapistReviewRepository } from "../../../domain/repositories/therapist-review.repository";
import { TYPES } from "../../../shared/constants/tokens";
import type { IGetTherapistReviewStatusUseCase } from "../../interfaces/review/IReviewUseCase";

@injectable()
export class GetTherapistReviewStatusUseCase implements IGetTherapistReviewStatusUseCase {
  constructor(
    @inject(TYPES.BookingRepository) private readonly _bookingRepo: IBookingRepository,
    @inject(TYPES.TherapistReviewRepository) private readonly _reviewRepo: ITherapistReviewRepository
  ) { }

  async execute({ userId, therapistId }: { userId: string; therapistId: string }) {
    const [canReview, review] = await Promise.all([
      this._bookingRepo.hasUserCompletedSessionWithTherapist(userId, therapistId),
      this._reviewRepo.findByUserAndTherapist(userId, therapistId),
    ]);

    return {
      canReview,
      userRating: review?.rating ?? null,
      userComment: review?.comment ?? null,
    };
  }
}
