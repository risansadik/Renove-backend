import type { Request, Response } from "express";
import { injectable, inject } from "inversify";
import type {
  IGetAllTherapistsUseCase,
  IGetAllUsersUseCase,
  IUpdateTherapistStatusUseCase,
  IUpdateUserStatusUseCase,
} from "../../application/interfaces/admin/IAdminUseCase.ts";
import type { IAdminLoginUseCase } from "../../application/interfaces/auth/IAuthUseCase.ts";
import type { GetAdminFinanceStatsUseCase, UpdatePlatformSettingsUseCase } from "../../application/use-cases/admin/admin-finance.usecase.ts";
import { PAGINATION, MESSAGES } from "../../shared/constants/index.ts";
import { TYPES } from "../../shared/constants/tokens.ts";
import { setAuthCookies, clearAuthCookies } from "../../shared/utils/jwt.ts";
import { ResponseModel } from "../../shared/utils/response-model.ts";

@injectable()
export class AdminController {
  constructor(
    @inject(TYPES.AdminLoginUseCase) private readonly _adminLoginUC: IAdminLoginUseCase,
    @inject(TYPES.GetAllUsersUseCase) private readonly _getAllUsersUC: IGetAllUsersUseCase,
    @inject(TYPES.UpdateUserStatusUseCase) private readonly _updateUserStatusUC: IUpdateUserStatusUseCase,
    @inject(TYPES.GetAllTherapistsUseCase) private readonly _getAllTherapistsUC: IGetAllTherapistsUseCase,
    @inject(TYPES.UpdateTherapistStatusUseCase) private readonly _updateTherapistStatusUC: IUpdateTherapistStatusUseCase,
    @inject(TYPES.AdminFinanceUseCase) private readonly _getAdminFinanceStatsUC: GetAdminFinanceStatsUseCase,
    @inject(TYPES.UpdatePlatformSettingsUseCase) private readonly _updatePlatformSettingsUC: UpdatePlatformSettingsUseCase
  ) {}

  public login = async (req: Request, res: Response): Promise<void> => {
    const { tokens, user } = await this._adminLoginUC.execute(req.body);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    res.json(ResponseModel.success(MESSAGES.ADMIN.LOGIN_SUCCESS, { admin: user }));
  };

  public logout = (_req: Request, res: Response): void => {
    clearAuthCookies(res);
    res.json(ResponseModel.success(MESSAGES.AUTH.LOGOUT_SUCCESS, null));
  };

  public getAllUsers = async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT;
    const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
    const users = await this._getAllUsersUC.execute({ page, limit, search });

    res.json(ResponseModel.success(MESSAGES.ADMIN.USERS_FETCHED, users.data, 200, {
      total: users.total,
      page,
      limit,
      totalPages: Math.ceil(users.total / limit),
    }));
  };

  public updateUserStatus = async (req: Request, res: Response): Promise<void> => {
    const result = await this._updateUserStatusUC.execute({ id: req.params.id, dto: req.body });
    res.json(ResponseModel.success(MESSAGES.ADMIN.USER_STATUS_UPDATED, result));
  };

  public getAllTherapists = async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT;
    const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
    const therapists = await this._getAllTherapistsUC.execute({ page, limit, search });

    res.json(ResponseModel.success(MESSAGES.ADMIN.THERAPISTS_FETCHED, therapists.data, 200, {
      total: therapists.total,
      page,
      limit,
      totalPages: Math.ceil(therapists.total / limit),
    }));
  };

  public updateTherapistStatus = async (req: Request, res: Response): Promise<void> => {
    const result = await this._updateTherapistStatusUC.execute({ id: req.params.id, dto: req.body });
    res.json(ResponseModel.success(MESSAGES.ADMIN.THERAPIST_STATUS_UPDATED, result));
  };

  public getFinanceStats = async (_req: Request, res: Response): Promise<void> => {
    const stats = await this._getAdminFinanceStatsUC.execute();
    res.json(ResponseModel.success(MESSAGES.ADMIN.FINANCE_STATS_FETCHED, stats));
  };

  public updateCommission = async (req: Request, res: Response): Promise<void> => {
    const { commissionPercentage } = req.body;
    const result = await this._updatePlatformSettingsUC.execute(Number(commissionPercentage));
    res.json(ResponseModel.success(MESSAGES.ADMIN.COMMISSION_UPDATED(Number(commissionPercentage)), result));
  };
}
