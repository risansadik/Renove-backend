import type { IUseCase } from "../IUseCase.ts";

export interface TherapistReviewStatus {
  canReview: boolean;
  userRating: number | null;
}

export type IGetTherapistReviewStatusUseCase = IUseCase<
  { userId: string; therapistId: string },
  TherapistReviewStatus
>;

export type IRateTherapistUseCase = IUseCase<
  { userId: string; therapistId: string; rating: number },
  { averageRating: number; totalRatings: number; userRating: number }
>;
