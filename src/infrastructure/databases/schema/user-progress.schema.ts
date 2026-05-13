import mongoose, { Schema, type Types, type Document } from "mongoose";

export interface IMission {
  id: string;
  label: string;
  xp: number;
  done: boolean;
}

export interface IMoodLog {
  mood: "great" | "good" | "okay" | "low" | "crisis";
  loggedAt: Date;
}

export interface IHabitDay {
  date: string; // YYYY-MM-DD
  done: boolean;
}

export interface IHabit {
  label: string;
  color: string;
  days: IHabitDay[];
}

export interface IUserProgressDocument extends Document {
  userId: Types.ObjectId;
  xp: number;
  level: number;
  streakDays: number;
  lastActivityDate?: Date;
  totalSessionsDone: number;
  missions: IMission[];
  moodLogs: IMoodLog[];
  habits: IHabit[];
  createdAt: Date;
  updatedAt: Date;
}

const MissionSchema = new Schema<IMission>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    xp: { type: Number, required: true },
    done: { type: Boolean, default: false },
  },
  { _id: false }
);

const MoodLogSchema = new Schema<IMoodLog>(
  {
    mood: { type: String, enum: ["great", "good", "okay", "low", "crisis"], required: true },
    loggedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const HabitDaySchema = new Schema<IHabitDay>(
  {
    date: { type: String, required: true },
    done: { type: Boolean, default: false },
  },
  { _id: false }
);

const HabitSchema = new Schema<IHabit>(
  {
    label: { type: String, required: true },
    color: { type: String, default: "#b89bbe" },
    days: [HabitDaySchema],
  },
  { _id: false }
);

const DEFAULT_MISSIONS: IMission[] = [
  { id: "1", label: "Morning mindfulness — 5 min meditation", xp: 20, done: false },
  { id: "2", label: "Log today's mood", xp: 10, done: false },
  { id: "3", label: "Drink 8 glasses of water", xp: 15, done: false },
  { id: "4", label: "Read 10 pages of recovery journal", xp: 25, done: false },
  { id: "5", label: "Evening check-in with AI companion", xp: 30, done: false },
];

const DEFAULT_HABITS: IHabit[] = [
  { label: "Meditation", color: "#b89bbe", days: [] },
  { label: "Exercise", color: "#9bb89e", days: [] },
  { label: "Journaling", color: "#c4a8d0", days: [] },
  { label: "No Substances", color: "#4a6b52", days: [] },
];

const UserProgressSchema = new Schema<IUserProgressDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streakDays: { type: Number, default: 0 },
    lastActivityDate: { type: Date },
    totalSessionsDone: { type: Number, default: 0 },
    missions: { type: [MissionSchema], default: DEFAULT_MISSIONS },
    moodLogs: { type: [MoodLogSchema], default: [] },
    habits: { type: [HabitSchema], default: DEFAULT_HABITS },
  },
  { timestamps: true }
);

export const UserProgressModel = mongoose.model<IUserProgressDocument>(
  "UserProgress",
  UserProgressSchema
);
