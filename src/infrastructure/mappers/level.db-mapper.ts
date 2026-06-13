import type { ILevelDocument } from "../databases/schema/level.schema.ts";
import type { LevelEntity } from "../../domain/entities/Level.entity.ts";

export class LevelDbMapper {
  static toEntity(doc: ILevelDocument): LevelEntity {
    const obj = doc.toObject({ versionKey: false }) as Record<string, unknown>;
    return {
      id: String(obj._id),
      userId: String(obj.userId),
      level: obj.level as number,
      world: obj.world as string,
      objective: obj.objective as string,
      target: obj.target as number,
      unit: obj.unit as string,
      xp: obj.xp as number,
      reward: obj.reward as string,
      difficulty: obj.difficulty as LevelEntity["difficulty"],
      unlockRequirement: obj.unlockRequirement as string,
      isCompleted: obj.isCompleted as boolean,
      completedAt: obj.completedAt as Date | undefined,
      createdAt: obj.createdAt as Date,
      updatedAt: obj.updatedAt as Date,
    };
  }
}
