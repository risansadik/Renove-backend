import type { Response } from "express";
import { inject, injectable } from "inversify";
import type { IGetTherapistReviewStatusUseCase, IRateTherapistUseCase } from "../../application/interfaces/review/IReviewUseCase.ts";
import { HttpStatus, MESSAGES } from "../../shared/constants/index.ts";
import { TYPES } from "../../shared/constants/tokens.ts";
import type { AuthRequest } from "../../shared/types/express.ts";
import { ResponseModel } from "../../shared/utils/response-model.ts";

@injectable()
export class TherapistReviewController {
  constructor(
    @inject(TYPES.GetTherapistReviewStatusUseCase) private readonly _getReviewStatusUC: IGetTherapistReviewStatusUseCase,
    @inject(TYPES.RateTherapistUseCase) private readonly _rateTherapistUC: IRateTherapistUseCase
  ) {}

  public getStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    const status = await this._getReviewStatusUC.execute({
      userId: req.user!.id,
      therapistId: req.params.therapistId,
    });

    res.json(ResponseModel.success(MESSAGES.REVIEW.STATUS_FETCHED, status));
  };

  public rate = async (req: AuthRequest, res: Response): Promise<void> => {
    const result = await this._rateTherapistUC.execute({
      userId: req.user!.id,
      therapistId: req.params.therapistId,
      rating: Number(req.body.rating),
    });

    res.status(HttpStatus.CREATED).json(ResponseModel.created(
      MESSAGES.REVIEW.SAVED,
      result
    ));
  };
}
