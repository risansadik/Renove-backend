import type { BaseRepository } from "./base.repository.ts";
import type { AdminEntity } from "../entities/Admin.entity.ts";

export interface IAdminRepository extends BaseRepository<AdminEntity> {
  findByEmail(email: string): Promise<AdminEntity | null>;
}
