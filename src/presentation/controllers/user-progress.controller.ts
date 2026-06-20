import type { Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../shared/constants/tokens.ts";
import type { AuthRequest } from "../../shared/types/express.ts";
import { ResponseModel } from "../../shared/utils/response-model.ts";
import { MESSAGES } from "../../shared/constants/index.ts";
import type {
  IGetUserJournalsUseCase,
  ICreateJournalUseCase,
  IDeleteJournalUseCase,
} from "../../application/interfaces/journal/IJournalUseCase.ts";
import type {
  IGetUserGoalsUseCase,
  ICreateGoalUseCase,
  IToggleGoalUseCase,
  IDeleteGoalUseCase,
} from "../../application/interfaces/goal/IGoalUseCase.ts";

@injectable()
export class UserProgressController {
  constructor(
    @inject(TYPES.GetUserJournalsUseCase)
    private readonly _getJournalsUC: IGetUserJournalsUseCase,
    @inject(TYPES.CreateJournalUseCase)
    private readonly _createJournalUC: ICreateJournalUseCase,
    @inject(TYPES.DeleteJournalUseCase)
    private readonly _deleteJournalUC: IDeleteJournalUseCase,
    @inject(TYPES.GetUserGoalsUseCase)
    private readonly _getGoalsUC: IGetUserGoalsUseCase,
    @inject(TYPES.CreateGoalUseCase)
    private readonly _createGoalUC: ICreateGoalUseCase,
    @inject(TYPES.ToggleGoalUseCase)
    private readonly _toggleGoalUC: IToggleGoalUseCase,
    @inject(TYPES.DeleteGoalUseCase)
    private readonly _deleteGoalUC: IDeleteGoalUseCase
  ) {}

  // ── Journals ──────────────────────────────────────────────

  public getJournals = async (req: AuthRequest, res: Response): Promise<void> => {
    const journals = await this._getJournalsUC.execute(req.user!.id);
    res.json(ResponseModel.success(MESSAGES.USER_PROGRESS.JOURNALS_FETCHED, journals));
  };

  public createJournal = async (req: AuthRequest, res: Response): Promise<void> => {
    const { title, content, mood } = req.body;
    const journal = await this._createJournalUC.execute({
      userId: req.user!.id,
      title,
      content,
      mood,
    });
    res.status(201).json(ResponseModel.created(MESSAGES.USER_PROGRESS.JOURNAL_CREATED, journal));
  };

  public deleteJournal = async (req: AuthRequest, res: Response): Promise<void> => {
    await this._deleteJournalUC.execute({ id: req.params.journalId, userId: req.user!.id });
    res.json(ResponseModel.success(MESSAGES.USER_PROGRESS.JOURNAL_DELETED, null));
  };

  // ── Goals ─────────────────────────────────────────────────

  public getGoals = async (req: AuthRequest, res: Response): Promise<void> => {
    const goals = await this._getGoalsUC.execute(req.user!.id);
    res.json(ResponseModel.success(MESSAGES.USER_PROGRESS.GOALS_FETCHED, goals));
  };

  public createGoal = async (req: AuthRequest, res: Response): Promise<void> => {
    const { text, category, targetDate } = req.body;
    const goal = await this._createGoalUC.execute({
      userId: req.user!.id,
      text,
      category,
      targetDate,
    });
    res.status(201).json(ResponseModel.created(MESSAGES.USER_PROGRESS.GOAL_CREATED, goal));
  };

  public toggleGoal = async (req: AuthRequest, res: Response): Promise<void> => {
    const goal = await this._toggleGoalUC.execute({
      id: req.params.goalId,
      userId: req.user!.id,
    });
    res.json(ResponseModel.success(MESSAGES.USER_PROGRESS.GOAL_UPDATED, goal));
  };

  public deleteGoal = async (req: AuthRequest, res: Response): Promise<void> => {
    await this._deleteGoalUC.execute({ id: req.params.goalId, userId: req.user!.id });
    res.json(ResponseModel.success(MESSAGES.USER_PROGRESS.GOAL_DELETED, null));
  };
}
