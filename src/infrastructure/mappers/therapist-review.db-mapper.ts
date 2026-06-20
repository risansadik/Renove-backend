import type { ITherapistReviewDocument } from "../databases/schema/therapist-review.schema.ts";
import type { TherapistReviewEntity } from "../../domain/entities/TherapistReview.entity.ts";

export class TherapistReviewDbMapper {
  static toEntity(doc: ITherapistReviewDocument): TherapistReviewEntity {
    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      therapistId: doc.therapistId.toString(),
      rating: doc.rating,
      comment: doc.comment,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}