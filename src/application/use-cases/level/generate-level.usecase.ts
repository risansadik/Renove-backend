import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import type { IGenerateLevelsUseCase, IGenerateLevelsInput } from "../../interfaces/level/ILevelUseCase.ts";
import type { ILevelRepository } from "../../../domain/repositories/level.repository.ts";
import type { IRagService } from "../../interfaces/services/IRagService.ts";
import type { LevelEntity } from "../../../domain/entities/Level.entity.ts";

@injectable()
export class GenerateLevelsUseCase implements IGenerateLevelsUseCase {
  constructor(
    @inject(TYPES.LevelRepository) private readonly _levelRepo: ILevelRepository,
    @inject(TYPES.RagService) private readonly _ragService: IRagService,
  ) {}

  async execute({ userId, dto }: IGenerateLevelsInput): Promise<LevelEntity[]> {
    let existing = await this._levelRepo.findByUserId(userId);

    if (dto.regenerate) {
      await this._levelRepo.deleteAllByUserId(userId);
      existing = [];
    } else {
      const hasAllRequested = Array.from({ length: dto.endLevel - dto.startLevel + 1 }, (_, i) => i + dto.startLevel)
        .every((lvl) => existing.some((e) => e.level === lvl));
      if (hasAllRequested && existing.length > 0) {
        return existing;
      }
    }

    const previousLevels = existing.map(l => ({
      level: l.level,
      world: l.world,
      objective: l.objective,
      target: l.target,
      unit: l.unit,
      xp: l.xp,
      reward: l.reward,
      difficulty: l.difficulty,
      unlockRequirement: l.unlockRequirement
    }));

    const rawLevels = await this._ragService.generateLevels({
      userId,
      addictionType: dto.addictionType,
      severity: dto.severity,
      interests: dto.interests,
      startLevel: dto.startLevel,
      endLevel: dto.endLevel,
      previousLevels: previousLevels.length > 0 ? previousLevels : undefined,
    });

    const saved = await Promise.all(
      rawLevels.map((level) =>
        this._levelRepo.create({
          ...level,
          userId,
          isCompleted: false,
        })
      )
    );

    return [...existing, ...saved].sort((a, b) => a.level - b.level);
  }
}