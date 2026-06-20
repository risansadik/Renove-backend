import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface ITherapistReviewDocument extends Document {
  userId: Types.ObjectId;
  therapistId: Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TherapistReviewSchema = new Schema<ITherapistReviewDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    therapistId: { type: Schema.Types.ObjectId, ref: "Therapist", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

TherapistReviewSchema.index({ userId: 1, therapistId: 1 }, { unique: true });
TherapistReviewSchema.index({ therapistId: 1 });

export const TherapistReviewModel = mongoose.model<ITherapistReviewDocument>(
  "TherapistReview",
  TherapistReviewSchema
);