import { IUserProgressRepository } from "../../../domain/repositories/user-progress.repository.ts";
import { IToggleMissionUseCase } from "../../interfaces/dashboard/IDashboardUseCase.ts";
import { injectable,inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";

@injectable()
export class ToggleMissionUseCase implements IToggleMissionUseCase{
  constructor(
    @inject(TYPES.UserProgressRepository) private readonly _progressRepo: IUserProgressRepository
) {}

  async execute({userId, missionId}:{userId: string, missionId: string}) {
    return this._progressRepo.toggleMission(userId, missionId);
  }
}
