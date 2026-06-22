import type { Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../shared/constants/tokens";
import type { AuthRequest } from "../../shared/types/express";
import { ResponseModel } from "../../shared/utils/response-model";
import type { IGetTherapistDashboardUseCase } from "../../application/interfaces/dashboard/IDashboardUseCase";

@injectable()
export class TherapistDashboardController {
  constructor(
    @inject(TYPES.GetTherapistDashboardUseCase) private readonly _getDashboardUC: IGetTherapistDashboardUseCase
  ) {}

  public getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
    const stats = await this._getDashboardUC.execute(req.user!.id);
    res.json(ResponseModel.success("Therapist dashboard fetched", stats));
  };
}
