import type { Response } from "express";
import { injectable, inject } from "inversify";
import type { GetTherapistDashboardUseCase } from "../../application/use-cases/dashboard/therapist-dashboard.usecase.ts";
import { TYPES } from "../../shared/constants/tokens.ts";
import type { AuthRequest } from "../../shared/types/express.ts";
import { ResponseModel } from "../../shared/utils/response-model.ts";

@injectable()
export class TherapistDashboardController {
  constructor(
    @inject(TYPES.GetTherapistDashboardUseCase) private readonly _getDashboardUC: GetTherapistDashboardUseCase
  ) {}

  public getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
    const stats = await this._getDashboardUC.execute(req.user!.id);
    res.json(ResponseModel.success("Therapist dashboard fetched", stats));
  };
}
