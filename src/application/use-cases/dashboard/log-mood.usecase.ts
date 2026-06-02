import { injectable,inject } from "inversify";
import { IUserProgressRepository } from "../../../domain/repositories/user-progress.repository.ts";
import { ILogMoodUseCase } from "../../interfaces/dashboard/IDashboardUseCase.ts";
import { TYPES } from "../../../shared/constants/tokens.ts";

@injectable()
export class LogMoodUseCase implements ILogMoodUseCase{

  constructor(
    @inject(TYPES.UserProgressRepository) private readonly _progressRepo: IUserProgressRepository)
   {}

  async execute({userId,mood}:{userId: string, mood: string}): Promise<void> {
    await this._progressRepo.logMood(userId, mood);
  }
}
