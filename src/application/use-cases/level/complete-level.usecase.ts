import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens";
import { NotFoundError } from "../../../shared/utils/AppError";
import type { ICompleteLevelUseCase, ICompleteLevelInput } from "../../interfaces/level/ILevelUseCase";
import type { ILevelRepository } from "../../../domain/repositories/level.repository";
import type { IUserProgressRepository } from "../../../domain/repositories/user-progress.repository";
import type { LevelEntity } from "../../../domain/entities/Level.entity";

@injectable()
export class CompleteLevelUseCase implements ICompleteLevelUseCase {
  constructor(
    @inject(TYPES.LevelRepository) private readonly _levelRepo: ILevelRepository,
    @inject(TYPES.UserProgressRepository) private readonly _progressRepo: IUserProgressRepository,
  ) {}

  async execute({ userId, levelId }: ICompleteLevelInput): Promise<LevelEntity> {
    const level = await this._levelRepo.findById(levelId);

    if (!level) throw new NotFoundError("Level not found");
    if (level.userId !== userId) throw new NotFoundError("Level not found");
    if (level.isCompleted) return level;

    const updated = await this._levelRepo.update(levelId, {
      isCompleted: true,
      completedAt: new Date(),
    });

    if (!updated) throw new NotFoundError("Level not found");

    await this._progressRepo.addXp(userId, level.xp);

    return updated;
  }
}