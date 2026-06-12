import type { TherapistReviewEntity } from "../entities/TherapistReview.entity.ts";

export interface ITherapistReviewRepository {
  upsert(review: Omit<TherapistReviewEntity, "id" | "createdAt" | "updatedAt">): Promise<TherapistReviewEntity>;
  findByUserAndTherapist(userId: string, therapistId: string): Promise<TherapistReviewEntity | null>;
  getRatingSummary(therapistId: string): Promise<{ averageRating: number; totalRatings: number }>;
}
