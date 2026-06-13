import mongoose, { Schema, type Types, type Document } from "mongoose";
import { THERAPIST_STATUS, type TherapistStatus } from "../../../shared/constants/index.ts";

export interface ITherapistDocument extends Document {
  name: string;
  email: string;
  password: string;
  gender: "male" | "female" | "other";
  qualification: string;
  specialization: string[];
  experience: number;
  consultationFee: number;
  bio: string;
  certifications?: string[];
  certificationFiles?: string[];
  profileImage?: string;
  status: TherapistStatus;
  isVerified: boolean;
  averageRating: number;
  totalRatings: number;
  pendingUpdates?: Record<string, unknown>;
  adminRejectionReason?: string;
  otp?: string;
  otpExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type ITherapistRaw = Omit<ITherapistDocument, keyof mongoose.Document> & { _id: Types.ObjectId }

const TherapistSchema = new Schema<ITherapistDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    qualification: { type: String, required: true },
    specialization: [{ type: String }],
    experience: { type: Number, required: true, min: 0 },
    consultationFee: { type: Number, required: true, min: 0 },
    bio: { type: String, required: true },
    certifications: [{ type: String }],
    certificationFiles: [{ type: String }],
    profileImage: { type: String },
    status: {
      type: String,
      enum: Object.values(THERAPIST_STATUS),
      default: THERAPIST_STATUS.PENDING,
    },
    isVerified: { type: Boolean, default: false },
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    pendingUpdates: { type: Schema.Types.Mixed },
    adminRejectionReason: { type: String },
    otp: { type: String },
    otpExpiry: { type: Date },
  },
  { timestamps: true }
);

export const TherapistModel = mongoose.model<ITherapistDocument>("Therapist", TherapistSchema);
