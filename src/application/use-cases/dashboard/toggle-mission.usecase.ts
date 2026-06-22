import type { IUserProgressRepository } from "../../../domain/repositories/user-progress.repository";
import { IToggleMissionUseCase } from "../../interfaces/dashboard/IDashboardUseCase";
import { injectable,inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens";

@injectable()
export class ToggleMissionUseCase implements IToggleMissionUseCase{
  constructor(
    @inject(TYPES.UserProgressRepository) private readonly _progressRepo: IUserProgressRepository
) {}

  async execute({userId, missionId}:{userId: string, missionId: string}) {
    return this._progressRepo.toggleMission(userId, missionId);
  }
}
