import type { TherapistStatus } from "../../shared/constants/index.js";

export interface TherapistEntity {
  id: string;
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
  otp?: string;
  otpExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}
