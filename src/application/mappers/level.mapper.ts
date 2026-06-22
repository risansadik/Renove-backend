import type { LevelEntity } from "../../domain/entities/Level.entity";
import type { LevelDifficulty } from "../../shared/constants/index";

export interface PublicLevelDTO {
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

export class LevelMapper {
  static toPublicDTO(entity: LevelEntity): PublicLevelDTO {
    return {
      id: entity.id,
      userId: entity.userId,
      level: entity.level,
      world: entity.world,
      objective: entity.objective,
      target: entity.target,
      unit: entity.unit,
      xp: entity.xp,
      reward: entity.reward,
      difficulty: entity.difficulty,
      unlockRequirement: entity.unlockRequirement,
      isCompleted: entity.isCompleted,
      completedAt: entity.completedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toPublicDTOList(entities: LevelEntity[]): PublicLevelDTO[] {
    return entities.map(e => this.toPublicDTO(e));
  }
}
