import { PublicReviewItem } from "../../../domain/entities/TherapistReview.entity.ts";
import type { IUseCase } from "../IUseCase.ts";

export interface TherapistReviewStatus {
  canReview: boolean;
  userRating: number | null;
  userComment: string | null;
}

export type IGetTherapistReviewStatusUseCase = IUseCase<
  { userId: string; therapistId: string },
  TherapistReviewStatus
>;

export type IRateTherapistUseCase = IUseCase<
  { userId: string; therapistId: string; rating: number; comment?: string },
  { averageRating: number; totalRatings: number; userRating: number; userComment: string | null }
>;

export type IGetTherapistReviewsUseCase = IUseCase<
  { therapistId: string },
  PublicReviewItem[]
>;