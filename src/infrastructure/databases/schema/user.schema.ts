import mongoose, { Schema, type Types, type Document } from "mongoose";
import { USER_STATUS, type UserStatus } from "../../../shared/constants/index";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password?: string;
  isGoogleAuth: boolean;
  profileImage?: string;
  isVerified: boolean;
  status: UserStatus;
  createdAt : Date;
  updatedAt : Date;
}

export type IUserRaw = Omit<IUserDocument, keyof mongoose.Document> & {_id : Types.ObjectId}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    isGoogleAuth: { type: Boolean, default: false },
    profileImage: { type: String },
    isVerified: { type: Boolean, default: false },
    status: { type: String, enum: Object.values(USER_STATUS), default: USER_STATUS.ACTIVE },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUserDocument>("User", UserSchema);