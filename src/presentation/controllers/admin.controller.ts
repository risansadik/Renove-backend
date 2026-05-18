import type { Request, Response, NextFunction } from "express";
import { AdminLoginUseCase } from "../../application/use-cases/auth/admin-login.usecase.js";
import {
  GetAllUsersUseCase,
  UpdateUserStatusUseCase,
  GetAllTherapistsUseCase,
  UpdateTherapistStatusUseCase,
} from "../../application/use-cases/admin/admin-management.usecase.js";
import { AdminRepository } from "../../infrastructure/repositories/admin.repository.impl.js";
import { UserRepository } from "../../infrastructure/repositories/user.repository.impl.js";
import { TherapistRepository } from "../../infrastructure/repositories/therapist.repository.impl.js";
import { ResponseModel } from "../../shared/utils/response-model.js";
import { setAuthCookies, clearAuthCookies } from "../../shared/utils/jwt.js";

const adminRepo = new AdminRepository();
const userRepo = new UserRepository();
const therapistRepo = new TherapistRepository();

const adminLoginUC = new AdminLoginUseCase(adminRepo);
const getAllUsersUC = new GetAllUsersUseCase(userRepo);
const updateUserStatusUC = new UpdateUserStatusUseCase(userRepo);
const getAllTherapistsUC = new GetAllTherapistsUseCase(therapistRepo);
const updateTherapistStatusUC = new UpdateTherapistStatusUseCase(therapistRepo);

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
};