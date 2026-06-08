import type { AuthenticatedRequest } from "../../shared/types/express.ts";
import { injectable, inject } from "inversify";
import type { Response } from "express";
import { TYPES } from "../../shared/constants/tokens.ts";
import { ResponseModel } from "../../shared/utils/response-model.ts";
import { HttpStatus, MESSAGES } from "../../shared/constants/index.ts";
import type {
  IGenerateLevelsUseCase,
  IGetUserLevelsUseCase,
  ICompleteLevelUseCase,
} from "../../application/interfaces/level/ILevelUseCase.ts";

@injectable()
export class LevelController {
  constructor(
    @inject(TYPES.GenerateLevelsUseCase) private readonly _generateUC: IGenerateLevelsUseCase,
    @inject(TYPES.GetUserLevelsUseCase) private readonly _getUC: IGetUserLevelsUseCase,
    @inject(TYPES.CompleteLevelUseCase) private readonly _completeUC: ICompleteLevelUseCase,
  ) {}

  public generate = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user.id;
    const levels = await this._generateUC.execute({ userId, dto: req.body });
    const message = req.body.regenerate
      ? MESSAGES.LEVEL.REGENERATED
      : MESSAGES.LEVEL.GENERATED;
    res.status(HttpStatus.CREATED).json(ResponseModel.success(message, levels));
  };

  public getLevels = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user.id;
    const levels = await this._getUC.execute(userId);
    res.json(ResponseModel.success(MESSAGES.LEVEL.FETCHED, levels));
  };

  public completeLevel = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user.id;
    const { levelId } = req.params;
    const level = await this._completeUC.execute({ userId, levelId });
    res.json(ResponseModel.success(MESSAGES.LEVEL.COMPLETED, level));
  };
}