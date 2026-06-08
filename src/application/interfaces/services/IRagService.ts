import type { LevelEntity } from "../../../domain/entities/Level.entity.ts";

export interface RagInput {
  userId: string;
  addictionType: string;
  severity: string;
  interests: string[];
}

export type RawLevelPayload = Omit<
  LevelEntity,
  "id" | "userId" | "isCompleted" | "completedAt" | "createdAt" | "updatedAt"
>;

export interface IRagService {
  generateLevels(input: RagInput): Promise<RawLevelPayload[]>;
}