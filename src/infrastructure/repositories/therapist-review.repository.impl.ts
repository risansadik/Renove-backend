import { injectable } from "inversify";
import { Types } from "mongoose";
import type { TherapistReviewEntity } from "../../domain/entities/TherapistReview.entity.ts";
import type { ITherapistReviewRepository } from "../../domain/repositories/therapist-review.repository.ts";
import { TherapistReviewModel, type ITherapistReviewDocument } from "../databases/schema/therapist-review.schema.ts";

@injectable()
export class TherapistReviewRepository implements ITherapistReviewRepository {
  private _toEntity(doc: ITherapistReviewDocument): TherapistReviewEntity {
    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      therapistId: doc.therapistId.toString(),
      rating: doc.rating,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async upsert(review: Omit<TherapistReviewEntity, "id" | "createdAt" | "updatedAt">): Promise<TherapistReviewEntity> {
    const doc = await TherapistReviewModel.findOneAndUpdate(
      { userId: review.userId, therapistId: review.therapistId },
      { $set: { rating: review.rating } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).exec();

    return this._toEntity(doc);
  }

  async findByUserAndTherapist(userId: string, therapistId: string): Promise<TherapistReviewEntity | null> {
    const doc = await TherapistReviewModel.findOne({ userId, therapistId }).exec();
    return doc ? this._toEntity(doc) : null;
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
