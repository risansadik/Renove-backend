import type { BaseRepository } from "./base.repository";
import type { AdminEntity } from "../entities/Admin.entity";

export interface IAdminRepository extends BaseRepository<AdminEntity> {
  findByEmail(email: string): Promise<AdminEntity | null>;
}