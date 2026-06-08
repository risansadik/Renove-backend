import type { MissionEntity, UserProgressEntity } from "../entities/UserProgress.entity.ts";

export interface IUserProgressRepository {
  findOrCreate(userId: string): Promise<UserProgressEntity>;
  getDashboard(userId: string): Promise<UserProgressEntity>;
  logMood(userId: string, mood: string): Promise<void>;
  toggleMission(userId: string, missionId: string): Promise<MissionEntity[]>;
  updateStreak(userId: string): Promise<void>;
  addXp(userId: string, xp: number): Promise<void>;
}
