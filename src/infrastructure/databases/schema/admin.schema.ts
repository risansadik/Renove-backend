import mongoose, { Schema, type Types, type Document } from "mongoose";

export interface IAdminDocument extends Document {
  name: string;
  email: string;
  password: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type IAdminRaw = Omit<IAdminDocument, keyof mongoose.Document> & {_id : Types.ObjectId}

const AdminSchema = new Schema<IAdminDocument>(
  {
    name: { type: String, required: true, default: "Admin" },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    profileImage: { type: String },
  },
  { timestamps: true }
);

export const AdminModel = mongoose.model<IAdminDocument>("Admin", AdminSchema);