import type { TherapistReviewEntity, PublicReviewItem } from "../entities/TherapistReview.entity";

export interface ITherapistReviewRepository {
  upsert(review: Omit<TherapistReviewEntity, "id" | "createdAt" | "updatedAt">): Promise<TherapistReviewEntity>;
  findByUserAndTherapist(userId: string, therapistId: string): Promise<TherapistReviewEntity | null>;
  getRatingSummary(therapistId: string): Promise<{ averageRating: number; totalRatings: number }>;
  findByTherapist(therapistId: string, limit: number): Promise<PublicReviewItem[]>;
}