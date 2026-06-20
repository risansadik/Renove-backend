export interface TherapistReviewEntity {
  id?: string;
  userId: string;
  therapistId: string;
  rating: number;
  comment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PublicReviewItem {
  id: string;
  userName: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}