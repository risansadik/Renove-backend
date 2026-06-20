import { TherapistReviewEntity } from "../../domain/entities/TherapistReview.entity.ts";

export interface PublicTherapistReviewDTO {
  id?: string;
  userId: string;
  therapistId: string;
  rating: number;
  comment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class TherapistReviewMapper {
  static toPublicDTO(entity: TherapistReviewEntity): PublicTherapistReviewDTO {
    return {
      id: entity.id,
      userId: entity.userId,
      therapistId: entity.therapistId,
      rating: entity.rating,
      comment: entity.comment,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toPublicDTOList(entities: TherapistReviewEntity[]): PublicTherapistReviewDTO[] {
    return entities.map(e => this.toPublicDTO(e));
  }
}