import { injectable } from "inversify";
import { Types } from "mongoose";
import type { PublicReviewItem, TherapistReviewEntity } from "../../domain/entities/TherapistReview.entity";
import type { ITherapistReviewRepository } from "../../domain/repositories/therapist-review.repository";
import { TherapistReviewModel } from "../databases/schema/therapist-review.schema";
import { TherapistReviewDbMapper } from "../mappers/therapist-review.db-mapper";

@injectable()
export class TherapistReviewRepository implements ITherapistReviewRepository {
  async upsert(review: Omit<TherapistReviewEntity, "id" | "createdAt" | "updatedAt">): Promise<TherapistReviewEntity> {
    const updateFields: Record<string, unknown> = { rating: review.rating };
    if (review.comment !== undefined) updateFields.comment = review.comment;

    const doc = await TherapistReviewModel.findOneAndUpdate(
      { userId: review.userId, therapistId: review.therapistId },
      { $set: updateFields },
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

  async findByTherapist(therapistId: string, limit: number): Promise<PublicReviewItem[]> {
    const results = await TherapistReviewModel.aggregate<{
      _id: Types.ObjectId;
      rating: number;
      comment?: string;
      createdAt: Date;
      userName: string;
    }>([
      {
        $match: {
          therapistId: new Types.ObjectId(therapistId),
          comment: { $exists: true, $ne: "" },
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          rating: 1,
          comment: 1,
          createdAt: 1,
          userName: "$user.name",
        },
      },
    ]).exec();

    return results.map((r) => ({
      id: r._id.toString(),
      userName: r.userName,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
    }));
  }
}
