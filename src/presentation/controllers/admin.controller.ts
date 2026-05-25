import type { Request, Response, NextFunction } from "express";
import { AdminLoginUseCase } from "../../application/use-cases/auth/admin-login.usecase.ts";
import {
  GetAllUsersUseCase,
  UpdateUserStatusUseCase,
  GetAllTherapistsUseCase,
  UpdateTherapistStatusUseCase,
} from "../../application/use-cases/admin/admin-management.usecase.ts";
import { AdminRepository } from "../../infrastructure/repositories/admin.repository.impl.ts";
import { UserRepository } from "../../infrastructure/repositories/user.repository.impl.ts";
import { TherapistRepository } from "../../infrastructure/repositories/therapist.repository.impl.ts";
import { SettingsRepositoryImpl } from "../../infrastructure/repositories/settings.repository.impl.ts";
import { GetAdminFinanceStatsUseCase, UpdatePlatformSettingsUseCase } from "../../application/use-cases/admin/admin-finance.usecase.ts";
import { ResponseModel } from "../../shared/utils/response-model.ts";
import { setAuthCookies, clearAuthCookies } from "../../shared/utils/jwt.ts";

const adminRepo = new AdminRepository();
const userRepo = new UserRepository();
const therapistRepo = new TherapistRepository();
const settingsRepo = new SettingsRepositoryImpl();

const adminLoginUC = new AdminLoginUseCase(adminRepo);
const getAllUsersUC = new GetAllUsersUseCase(userRepo);
const updateUserStatusUC = new UpdateUserStatusUseCase(userRepo);
const getAllTherapistsUC = new GetAllTherapistsUseCase(therapistRepo);
const updateTherapistStatusUC = new UpdateTherapistStatusUseCase(therapistRepo);
const getAdminFinanceStatsUC = new GetAdminFinanceStatsUseCase(settingsRepo);
const updatePlatformSettingsUC = new UpdatePlatformSettingsUseCase(settingsRepo);


export const adminController = {
  login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tokens, user } = await adminLoginUC.execute(req.body);
      setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
      res.json(ResponseModel.success("Admin login successful", { admin: user }));
    } catch (err) {
      next(err);
    }
  },

  logout: (_req: Request, res: Response): void => {
    clearAuthCookies(res);
    res.json(ResponseModel.success("Logged out successfully", null));
  },

  getAllUsers: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const users = await getAllUsersUC.execute({ page, limit });
      
      const totalPages = Math.ceil(users.total / limit);
      res.json(ResponseModel.success("Users fetched", users.data, 200, {
        total: users.total,
        page,
        limit,
        totalPages
      }));
    } catch (err) {
      next(err);
    }
  },

  updateUserStatus: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await updateUserStatusUC.execute({ id: req.params.id, dto: req.body });
      res.json(ResponseModel.success("User status updated", result));
    } catch (err) {
      next(err);
    }
  },

  getAllTherapists: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const therapists = await getAllTherapistsUC.execute({ page, limit });
      
      const totalPages = Math.ceil(therapists.total / limit);
      res.json(ResponseModel.success("Therapists fetched", therapists.data, 200, {
        total: therapists.total,
        page,
        limit,
        totalPages
      }));
    } catch (err) {
      next(err);
    }
  },

  updateTherapistStatus: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await updateTherapistStatusUC.execute({ id: req.params.id, dto: req.body });
      res.json(ResponseModel.success("Therapist status updated", result));
    } catch (err) {
      next(err);
    }
  },

  getFinanceStats: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await getAdminFinanceStatsUC.execute();
      res.json(ResponseModel.success("Admin finance stats fetched successfully", stats));
    } catch (err) {
      next(err);
    }
  },

  updateCommission: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { commissionPercentage } = req.body;
      const result = await updatePlatformSettingsUC.execute(Number(commissionPercentage));
      res.json(ResponseModel.success("Platform commission updated successfully", result));
    } catch (err) {
      next(err);
    }
  },
};