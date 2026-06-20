import mongoose, { Schema, type Types, type Document } from "mongoose";

export interface IUserJournalDocument extends Document {
  userId: Types.ObjectId;
  title: string;
  content: string;
  mood: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserJournalSchema = new Schema<IUserJournalDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    mood: { type: String, required: true, default: "okay" },
  },
  { timestamps: true }
);

export const UserJournalModel = mongoose.model<IUserJournalDocument>(
  "UserJournal",
  UserJournalSchema
);
