import { injectable } from "inversify";
import { Types } from "mongoose";
import type { TherapistReviewEntity } from "../../domain/entities/TherapistReview.entity.ts";
import type { ITherapistReviewRepository } from "../../domain/repositories/therapist-review.repository.ts";
import { TherapistReviewModel } from "../databases/schema/therapist-review.schema.ts";
import { TherapistReviewDbMapper } from "../mappers/therapist-review.db-mapper.ts";

@injectable()
export class TherapistReviewRepository implements ITherapistReviewRepository {
  async upsert(review: Omit<TherapistReviewEntity, "id" | "createdAt" | "updatedAt">): Promise<TherapistReviewEntity> {
    const doc = await TherapistReviewModel.findOneAndUpdate(
      { userId: review.userId, therapistId: review.therapistId },
      { $set: { rating: review.rating } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).exec();

    return TherapistReviewDbMapper.toEntity(doc);
  }

  async findByUserAndTherapist(userId: string, therapistId: string): Promise<TherapistReviewEntity | null> {
    const doc = await TherapistReviewModel.findOne({ userId, therapistId }).exec();
    return doc ? TherapistReviewDbMapper.toEntity(doc) : null;
  }

  async getRatingSummary(therapistId: string): Promise<{ averageRating: number; totalRatings: number }> {
    const [summary] = await TherapistReviewModel.aggregate<{ averageRating: number; totalRatings: number }>([
      { $match: { therapistId: new Types.ObjectId(therapistId) } },
      { $group: { _id: "$therapistId", averageRating: { $avg: "$rating" }, totalRatings: { $sum: 1 } } },
    ]);

    return {
      averageRating: summary ? Math.round(summary.averageRating * 10) / 10 : 0,
      totalRatings: summary?.totalRatings ?? 0,
    };
  }
}
