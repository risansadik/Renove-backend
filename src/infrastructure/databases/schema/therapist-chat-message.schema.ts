import mongoose, { Schema, type Document, type Types } from "mongoose";
import type { TherapistChatSenderRole } from "../../../shared/constants/index";

export interface ITherapistChatMessageDocument extends Document {
  threadId: Types.ObjectId;
  senderId: Types.ObjectId;
  senderRole: TherapistChatSenderRole;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

export type ITherapistChatMessageRaw = Omit<ITherapistChatMessageDocument, keyof mongoose.Document> & {
  _id: Types.ObjectId;
};

const TherapistChatMessageSchema = new Schema<ITherapistChatMessageDocument>(
  {
    threadId: { type: Schema.Types.ObjectId, ref: "TherapistChatThread", required: true },
    senderId: { type: Schema.Types.ObjectId, required: true },
    senderRole: { type: String, enum: ["user", "therapist"], required: true },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

TherapistChatMessageSchema.index({ threadId: 1, createdAt: 1 });

export const TherapistChatMessageModel = mongoose.model<ITherapistChatMessageDocument>(
  "TherapistChatMessage",
  TherapistChatMessageSchema
);