import { inject, injectable } from "inversify";
import type { PublicReviewItem } from "../../../domain/entities/TherapistReview.entity";
import type { ITherapistReviewRepository } from "../../../domain/repositories/therapist-review.repository";
import { TYPES } from "../../../shared/constants/tokens";
import type { IGetTherapistReviewsUseCase } from "../../interfaces/review/IReviewUseCase";
import { REVIEWS_LIMIT } from "../../../shared/constants/index";

@injectable()
export class GetTherapistReviewsUseCase implements IGetTherapistReviewsUseCase {
  constructor(
    @inject(TYPES.TherapistReviewRepository)
    private readonly _reviewRepo: ITherapistReviewRepository
  ) {}

  async execute({ therapistId }: { therapistId: string }): Promise<PublicReviewItem[]> {
    return this._reviewRepo.findByTherapist(therapistId, REVIEWS_LIMIT);
  }
}