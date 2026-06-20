import mongoose, { Schema, type Types, type Document } from "mongoose";

export interface IUserGoalDocument extends Document {
  userId: Types.ObjectId;
  text: string;
  completed: boolean;
  category: string;
  targetDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserGoalSchema = new Schema<IUserGoalDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    text: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
    category: { type: String, required: true, default: "Wellness" },
    targetDate: { type: String },
  },
  { timestamps: true }
);

export const UserGoalModel = mongoose.model<IUserGoalDocument>(
  "UserGoal",
  UserGoalSchema
);
