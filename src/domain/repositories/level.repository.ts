import type { BaseRepository } from "./base.repository";
import type { LevelEntity } from "../entities/Level.entity";

export interface ILevelRepository extends BaseRepository<LevelEntity> {
  findByUserId(userId: string): Promise<LevelEntity[]>;
  findActiveByUserId(userId: string): Promise<LevelEntity | null>;
  deleteAllByUserId(userId: string): Promise<void>;
  countByUserId(userId: string): Promise<number>;
}