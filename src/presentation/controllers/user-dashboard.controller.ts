import type { Response } from "express";
import { injectable, inject } from "inversify";
import { PAGINATION, MESSAGES } from "../../shared/constants/index";
import { TYPES } from "../../shared/constants/tokens";
import type { AuthRequest } from "../../shared/types/express";
import { ResponseModel } from "../../shared/utils/response-model";
import type { IGetApprovedTherapistsUseCase, IGetUserDashboardUseCase, ILogMoodUseCase, IToggleMissionUseCase } from "../../application/interfaces/dashboard/IDashboardUseCase";

@injectable()
export class UserDashboardController {
  constructor(
    @inject(TYPES.GetUserDashboardUseCase) private readonly _getDashboardUC: IGetUserDashboardUseCase,
    @inject(TYPES.LogMoodUseCase) private readonly _logMoodUC: ILogMoodUseCase,
    @inject(TYPES.ToggleMissionUseCase) private readonly _toggleMissionUC: IToggleMissionUseCase,
    @inject(TYPES.GetApprovedTherapistsUseCase) private readonly _getApprovedTherapistsUC: IGetApprovedTherapistsUseCase
  ) {}

  public getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
    const dashboard = await this._getDashboardUC.execute(req.user!.id);
    res.json(ResponseModel.success(MESSAGES.DASHBOARD.FETCHED, dashboard));
  };

  public logMood = async (req: AuthRequest, res: Response): Promise<void> => {
    await this._logMoodUC.execute({userId:req.user!.id, mood:req.body.mood});
    res.json(ResponseModel.success(MESSAGES.DASHBOARD.MOOD_LOGGED, null));
  };

  public toggleMission = async (req: AuthRequest, res: Response): Promise<void> => {
    const missions = await this._toggleMissionUC.execute({userId:req.user!.id, missionId:req.params.missionId});
    res.json(ResponseModel.success(MESSAGES.DASHBOARD.MISSION_UPDATED, { missions }));
  };

  public getApprovedTherapists = async (req: AuthRequest, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT;
    const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
    const therapists = await this._getApprovedTherapistsUC.execute({ page, limit, search });

    res.json(ResponseModel.success(MESSAGES.DASHBOARD.THERAPISTS_FETCHED, therapists.data, 200, {
      total: therapists.total,
      page,
      limit,
      totalPages: Math.ceil(therapists.total / limit),
    }));
  };
}
