import type { IUseCase } from "../IUseCase.ts";
import type { LevelEntity } from "../../../domain/entities/Level.entity.ts";
import type { GenerateLevelsDTO } from "../../dto/level/level.dto.ts";

export interface IGenerateLevelsInput {
    userId: string;
    dto: GenerateLevelsDTO;
}

export interface ICompleteLevelInput {
    userId: string;
    levelId: string;
}

export type IGenerateLevelsUseCase = IUseCase<IGenerateLevelsInput, LevelEntity[]>;
export type IGetUserLevelsUseCase = IUseCase<string, LevelEntity[]>;
export type ICompleteLevelUseCase = IUseCase<ICompleteLevelInput, LevelEntity>;