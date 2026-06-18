import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface ITherapistChatThreadDocument extends Document {
  userId: Types.ObjectId;
  therapistId: Types.ObjectId;
  expiresAt: Date;
  lastBookingId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type ITherapistChatThreadRaw = Omit<ITherapistChatThreadDocument, keyof mongoose.Document | "userId" | "therapistId"> & {
  _id: Types.ObjectId;
  userId: Types.ObjectId | { _id: Types.ObjectId; name: string; email: string };
  therapistId: Types.ObjectId | { _id: Types.ObjectId; name: string };
};

const TherapistChatThreadSchema = new Schema<ITherapistChatThreadDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    therapistId: { type: Schema.Types.ObjectId, ref: "Therapist", required: true },
    expiresAt: { type: Date, required: true },
    lastBookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
  },
  { timestamps: true }
);

TherapistChatThreadSchema.index({ userId: 1, therapistId: 1 }, { unique: true });

export const TherapistChatThreadModel = mongoose.model<ITherapistChatThreadDocument>(
  "TherapistChatThread",
  TherapistChatThreadSchema
);