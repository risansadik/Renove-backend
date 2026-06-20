import { inject, injectable } from "inversify";
import type { PublicReviewItem } from "../../../domain/entities/TherapistReview.entity.ts";
import type { ITherapistReviewRepository } from "../../../domain/repositories/therapist-review.repository.ts";
import { TYPES } from "../../../shared/constants/tokens.ts";
import type { IGetTherapistReviewsUseCase } from "../../interfaces/review/IReviewUseCase.ts";
import { REVIEWS_LIMIT } from "../../../shared/constants/index.ts";

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