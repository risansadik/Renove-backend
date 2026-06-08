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
    if (!dto.regenerate) {
      const existing = await this._levelRepo.findByUserId(userId);
      if (existing.length > 0) return existing;
    } else {
      await this._levelRepo.deleteAllByUserId(userId);
    }

    const rawLevels = await this._ragService.generateLevels({
      userId,
      addictionType: dto.addictionType,
      severity: dto.severity,
      interests: dto.interests,
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

    return saved;
  }
}