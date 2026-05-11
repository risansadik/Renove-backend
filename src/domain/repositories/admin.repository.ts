import type { BaseRepository } from "./base.repository.js";
import type { AdminEntity } from "../entities/Admin.entity.js";

export interface IAdminRepository extends BaseRepository<AdminEntity> {
  findByEmail(email: string): Promise<AdminEntity | null>;
}