import { injectable,inject } from "inversify";
import type { IUserProgressRepository } from "../../../domain/repositories/user-progress.repository";
import { ILogMoodUseCase } from "../../interfaces/dashboard/IDashboardUseCase";
import { TYPES } from "../../../shared/constants/tokens";

@injectable()
export class LogMoodUseCase implements ILogMoodUseCase{

  constructor(
    @inject(TYPES.UserProgressRepository) private readonly _progressRepo: IUserProgressRepository)
   {}

  async execute({userId,mood}:{userId: string, mood: string}): Promise<void> {
    await this._progressRepo.logMood(userId, mood);
  }
}
