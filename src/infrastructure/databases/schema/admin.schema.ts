import mongoose, { Schema, Types, type Document } from "mongoose";

export interface IAdminDocument extends Document {
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export type IAdminRaw = Omit<IAdminDocument, keyof mongoose.Document> & {_id : Types.ObjectId}

const AdminSchema = new Schema<IAdminDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export const AdminModel = mongoose.model<IAdminDocument>("Admin", AdminSchema);