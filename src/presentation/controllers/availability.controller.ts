import type { Request, Response } from "express";
import { injectable, inject } from "inversify";
import type {
  ICreateAvailabilityUseCase,
  IDeleteAvailabilityRuleUseCase,
  IGetAvailableSlotsUseCase,
  IGetTherapistRulesUseCase,
  ILockSlotUseCase,
  IUnlockSlotUseCase,
} from "../../application/interfaces/availability/IAvailabilityUseCase.ts";
import { AvailabilityMapper } from "../../application/mappers/availability.mapper.ts";
import { HttpStatus, MESSAGES } from "../../shared/constants/index.ts";
import { TYPES } from "../../shared/constants/tokens.ts";
import type { AuthenticatedRequest } from "../../shared/types/express.ts";
import { AppError } from "../../shared/utils/AppError.ts";
import { ResponseModel } from "../../shared/utils/response-model.ts";

@injectable()
export class AvailabilityController {
  constructor(
    @inject(TYPES.CreateAvailabilityUseCase) private readonly _createAvailabilityUseCase: ICreateAvailabilityUseCase,
    @inject(TYPES.GetTherapistRulesUseCase) private readonly _getTherapistRulesUseCase: IGetTherapistRulesUseCase,
    @inject(TYPES.GetAvailableSlotsUseCase) private readonly _getAvailableSlotsUseCase: IGetAvailableSlotsUseCase,
    @inject(TYPES.DeleteAvailabilityRuleUseCase) private readonly _deleteAvailabilityRuleUseCase: IDeleteAvailabilityRuleUseCase,
    @inject(TYPES.LockSlotUseCase) private readonly _lockSlotUseCase: ILockSlotUseCase,
    @inject(TYPES.UnlockSlotUseCase) private readonly _unlockSlotUseCase: IUnlockSlotUseCase,
  ) { }

  public createRule = async (req: Request, res: Response): Promise<void> => {
    const therapistId = (req as AuthenticatedRequest).user.id;
    const data = { ...req.body, therapistId };
    const availability = await this._createAvailabilityUseCase.execute(data);
    res.status(HttpStatus.CREATED).json(ResponseModel.created(MESSAGES.AVAILABILITY.RULE_CREATED, AvailabilityMapper.toRulePublicDTO(availability)));
  };

  public getTherapistRules = async (req: Request, res: Response): Promise<void> => {
    const therapistId = (req as AuthenticatedRequest).user.id;
    const rules = await this._getTherapistRulesUseCase.execute(therapistId);
    res.json(ResponseModel.success(MESSAGES.AVAILABILITY.RULES_FETCHED, AvailabilityMapper.toRulePublicDTOList(rules)));
  };

  public getAvailableSlots = async (req: Request, res: Response): Promise<void> => {
    const { start, end } = req.query;

    if (!start || !end) {
      throw new AppError("Start and end dates are required", HttpStatus.BAD_REQUEST);
    }

    const slots = await this._getAvailableSlotsUseCase.execute({
      therapistId: req.params.therapistId,
      startDate: new Date(start as string),
      endDate: new Date(end as string)
    });

    res.json(ResponseModel.success(MESSAGES.AVAILABILITY.SLOTS_FETCHED, AvailabilityMapper.toSlotPublicDTOList(slots)));
  };

  public deleteRule = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const therapistId = (req as AuthenticatedRequest).user.id;

    await this._deleteAvailabilityRuleUseCase.execute({ id, therapistId });

    res.json(ResponseModel.success(MESSAGES.AVAILABILITY.RULE_DELETED, null));
  };

  public lockSlot = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthenticatedRequest).user.id;
    const { slotId } = req.params;
    const result = await this._lockSlotUseCase.execute({ slotId, userId });
    res.json(ResponseModel.success("Slot reserved successfully", result));
  };

  public unlockSlot = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthenticatedRequest).user.id;
    const { slotId } = req.params;
    await this._unlockSlotUseCase.execute({ slotId, userId });
    res.json(ResponseModel.success("Slot released successfully", null));
  };
}
