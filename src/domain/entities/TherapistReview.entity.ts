export interface TherapistReviewEntity {
  id?: string;
  userId: string;
  therapistId: string;
  rating: number;
  createdAt?: Date;
  updatedAt?: Date;
}
