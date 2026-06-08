import type { LevelDifficulty } from "../../shared/constants/index.ts";

export interface LevelEntity {
  id: string;
  userId: string;
  level: number;
  world: string;
  objective: string;
  target: number;
  unit: string;
  xp: number;
  reward: string;
  difficulty: LevelDifficulty;
  unlockRequirement: string;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}