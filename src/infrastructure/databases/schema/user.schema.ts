import mongoose, { Schema, type Document } from "mongoose";
import { USER_STATUS } from "../../../shared/constants/index.js";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password?: string;
  isGoogleAuth: boolean;
  isVerified: boolean;
  status: "active" | "blocked";
  otp?: string;
  otpExpiry?: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    isGoogleAuth: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    status: { type: String, enum: Object.values(USER_STATUS), default: USER_STATUS.ACTIVE },
    otp: { type: String },
    otpExpiry: { type: Date },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUserDocument>("User", UserSchema);