import type { BaseRepository } from "./base.repository.ts";
import type { UserEntity } from "../entities/User.entity.ts";
import type { UserStatus } from "../../shared/constants/index.ts";

export interface IUserRepository extends BaseRepository<UserEntity> {
  findByEmail(email: string): Promise<UserEntity | null>;
  verifyUser(email: string): Promise<void>;
  updateStatus(id: string, status: UserEntity["status"]): Promise<void>;
  countByStatus(status: UserStatus): Promise<number>;
}
