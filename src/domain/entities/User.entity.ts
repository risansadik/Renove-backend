import type { UserStatus } from "../../shared/constants/index";

export interface UserEntity {
  id: string;
  name: string;
  email: string;
  password?: string;
  isGoogleAuth: boolean;
  isVerified: boolean;
  status: UserStatus;
  otp?: string;
  otpExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}