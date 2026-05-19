import mongoose, { Schema, type Document } from "mongoose";

export interface ISettingsDocument extends Document {
  key: string;
  value: unknown;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettingsDocument>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export const SettingsModel = mongoose.model<ISettingsDocument>("Settings", SettingsSchema);
