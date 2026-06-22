import mongoose, { Schema, type Document, type Types } from "mongoose";
import { LEVEL_DIFFICULTY } from "../../../shared/constants/index";

export interface ILevelDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  level: number;
  world: string;
  objective: string;
  target: number;
  unit: string;
  xp: number;
  reward: string;
  difficulty: "Easy" | "Medium" | "Hard";
  unlockRequirement: string;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LevelSchema = new Schema<ILevelDocument>(
  {
    _id: {
      type: Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    level: { type: Number, required: true },
    world: { type: String, required: true, trim: true },
    objective: { type: String, required: true, trim: true },
    target: { type: Number, required: true },
    unit: { type: String, required: true, trim: true },
    xp: { type: Number, required: true },
    reward: { type: String, required: true, trim: true },
    difficulty: {
      type: String,
      enum: Object.values(LEVEL_DIFFICULTY),
      required: true,
    },
    unlockRequirement: { type: String, required: true, trim: true },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export const LevelModel = mongoose.model<ILevelDocument>("Level", LevelSchema);