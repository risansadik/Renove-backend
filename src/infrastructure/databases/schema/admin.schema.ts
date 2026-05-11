import mongoose, { Schema, type Document } from "mongoose";

export interface IAdminDocument extends Document {
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdminDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export const AdminModel = mongoose.model<IAdminDocument>("Admin", AdminSchema);