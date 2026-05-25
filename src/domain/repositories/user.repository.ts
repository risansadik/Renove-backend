import type { BaseRepository } from "./base.repository.ts";
import type { UserEntity } from "../entities/User.entity.ts";

export interface IUserRepository extends BaseRepository<UserEntity> {
  findByEmail(email: string): Promise<UserEntity | null>;
  updateOtp(email: string, otp: string, otpExpiry: Date): Promise<void>;
  verifyUser(email: string): Promise<void>;
  updateStatus(id: string, status: UserEntity["status"]): Promise<void>;
}
