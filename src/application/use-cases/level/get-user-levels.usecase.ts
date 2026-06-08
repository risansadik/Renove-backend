import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import type { IGetUserLevelsUseCase } from "../../interfaces/level/ILevelUseCase.ts";
import type { ILevelRepository } from "../../../domain/repositories/level.repository.ts";
import type { LevelEntity } from "../../../domain/entities/Level.entity.ts";

@injectable()
export class GetUserLevelsUseCase implements IGetUserLevelsUseCase {
  constructor(
    @inject(TYPES.LevelRepository) private readonly _levelRepo: ILevelRepository,
  ) {}

  async execute(userId: string): Promise<LevelEntity[]> {
    return this._levelRepo.findByUserId(userId);
  }
}