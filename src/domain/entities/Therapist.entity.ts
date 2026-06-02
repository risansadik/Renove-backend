import type { TherapistStatus } from "../../shared/constants/index.ts";

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
  pendingUpdates?: Partial<Omit<TherapistEntity, "id" | "email" | "password" | "status" | "isVerified" | "createdAt" | "updatedAt">>;
  adminRejectionReason?: string;
  otp?: string;
  otpExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}
