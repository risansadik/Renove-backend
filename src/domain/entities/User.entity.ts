import type { UserStatus } from "../../shared/constants/index";

export interface UserEntity {
  id: string;
  name: string;
  email: string;
  password?: string;
  isGoogleAuth: boolean;
  profileImage?: string;
  isVerified: boolean;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}
