import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.ts";
import { ResponseModel } from "../../shared/utils/response-model.ts";

import { GetUserProfileUseCase } from "../../application/use-cases/profile/get-user-profile.usecase.ts";
import { UpdateUserProfileUseCase } from "../../application/use-cases/profile/update-user-profile.usecase.ts";
import { ChangeUserPasswordUseCase } from "../../application/use-cases/profile/change-user-password.usecase.ts";

import { GetTherapistProfileUseCase } from "../../application/use-cases/profile/get-therapist-profile.usecase.ts";
import { UpdateTherapistProfileUseCase } from "../../application/use-cases/profile/update-therapist-profile.usecase.ts";
import { ChangeTherapistPasswordUseCase } from "../../application/use-cases/profile/change-therapist-password.usecase.ts";

import { GetAdminProfileUseCase } from "../../application/use-cases/profile/get-admin-profile.usecase.ts";
import { UpdateAdminProfileUseCase } from "../../application/use-cases/profile/update-admin-profile.usecase.ts";
import { ChangeAdminPasswordUseCase } from "../../application/use-cases/profile/change-admin-password.usecase.ts";

import { ReviewTherapistProfileUseCase } from "../../application/use-cases/admin/review-therapist-profile.usecase.ts";
import { TherapistModel, type ITherapistDocument } from "../../infrastructure/databases/schema/therapist.schema.ts";
import { THERAPIST_STATUS } from "../../shared/constants/index.ts";

type WithId<T> = T & { _id: { toString(): string } };

const getUserProfileUC = new GetUserProfileUseCase();
const updateUserProfileUC = new UpdateUserProfileUseCase();
const changeUserPasswordUC = new ChangeUserPasswordUseCase();

const getTherapistProfileUC = new GetTherapistProfileUseCase();
const updateTherapistProfileUC = new UpdateTherapistProfileUseCase();
const changeTherapistPasswordUC = new ChangeTherapistPasswordUseCase();

const getAdminProfileUC = new GetAdminProfileUseCase();
const updateAdminProfileUC = new UpdateAdminProfileUseCase();
const changeAdminPasswordUC = new ChangeAdminPasswordUseCase();

const reviewTherapistProfileUC = new ReviewTherapistProfileUseCase();

export const profileController = {
  // ── USER PROFILE ──
  getUserProfile: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await getUserProfileUC.execute(req.user!.id);
      const mapped = user ? {
        ...user,
        id: (user as WithId<typeof user>)._id.toString(),
      } : null;
      res.json(ResponseModel.success("User profile fetched", { user: mapped }));
    } catch (error) {
      next(error);
    }
  },
  updateUserProfile: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // If a file was uploaded (e.g. avatar), multer places it in req.file.path or similar depending on config.
      // Usually req.file.filename or Cloudinary URL.
      let profileImage = req.body.profileImage;
      if (req.file) {
        profileImage = req.file.path;
      }

      const updateData = {
        ...req.body,
        ...(profileImage && { profileImage })
      };

      const user = await updateUserProfileUC.execute(req.user!.id, updateData);
      const mapped = user ? {
        ...user,
        id: (user as WithId<typeof user>)._id.toString(),
      } : null;
      res.json(ResponseModel.success("User profile updated", { user: mapped }));
    } catch (error) {
      next(error);
    }
  },
  changeUserPassword: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;
      await changeUserPasswordUC.execute(req.user!.id, currentPassword, newPassword);
      res.json(ResponseModel.success("Password changed successfully", null));
    } catch (error) {
      next(error);
    }
  },

  // ── THERAPIST PROFILE ──
  getTherapistProfile: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const therapist = await getTherapistProfileUC.execute(req.user!.id);
      const mapped = therapist ? {
        ...therapist,
        id: (therapist as WithId<typeof therapist>)._id.toString(),
      } : null;
      res.json(ResponseModel.success("Therapist profile fetched", { therapist: mapped }));
    } catch (error) {
      next(error);
    }
  },
  updateTherapistProfile: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      let profileImage = req.body.profileImage;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (files?.profileImage?.[0]) {
        profileImage = files.profileImage[0].path;
      }

      let certificationFiles = req.body.certificationFiles;
      if (files?.certificationFiles) {
        certificationFiles = files.certificationFiles.map(f => f.path);
      }

      const updateData = {
        ...req.body,
        ...(profileImage && { profileImage }),
        ...(certificationFiles && { certificationFiles })
      };

      const therapist = await updateTherapistProfileUC.execute(req.user!.id, updateData);
      const mapped = therapist ? {
        ...therapist,
        id: (therapist as WithId<typeof therapist>)._id.toString(),
      } : null;
      res.json(ResponseModel.success("Therapist profile update processed", { therapist: mapped }));
    } catch (error) {
      next(error);
    }
  },
  changeTherapistPassword: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;
      await changeTherapistPasswordUC.execute(req.user!.id, currentPassword, newPassword);
      res.json(ResponseModel.success("Password changed successfully", null));
    } catch (error) {
      next(error);
    }
  },

  // ── ADMIN PROFILE ──
  getAdminProfile: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const admin = await getAdminProfileUC.execute(req.user!.id);
      const mapped = admin ? {
        ...admin,
        id: (admin as WithId<typeof admin>)._id.toString(),
      } : null;
      res.json(ResponseModel.success("Admin profile fetched", { admin: mapped }));
    } catch (error) {
      next(error);
    }
  },
  updateAdminProfile: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      let profileImage = req.body.profileImage;
      if (req.file) {
        profileImage = req.file.path;
      }

      const updateData = {
        ...req.body,
        ...(profileImage && { profileImage })
      };

      const admin = await updateAdminProfileUC.execute(req.user!.id, updateData);
      const mapped = admin ? {
        ...admin,
        id: (admin as WithId<typeof admin>)._id.toString(),
      } : null;
      res.json(ResponseModel.success("Admin profile updated", { admin: mapped }));
    } catch (error) {
      next(error);
    }
  },
  changeAdminPassword: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;
      await changeAdminPasswordUC.execute(req.user!.id, currentPassword, newPassword);
      res.json(ResponseModel.success("Password changed successfully", null));
    } catch (error) {
      next(error);
    }
  },

  // ── ADMIN: THERAPIST REVIEWS ──
  getPendingTherapistUpdates: async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pendingTherapists = await TherapistModel.find({ status: THERAPIST_STATUS.REVIEW_REQUIRED }).select("-password").lean<ITherapistDocument[]>();
      const mapped = pendingTherapists.map((t) => ({
        ...t,
        id: (t as WithId<ITherapistDocument>)._id.toString(),
      }));
      res.json(ResponseModel.success("Pending therapist updates fetched", { therapists: mapped }));
    } catch (error) {
      next(error);
    }
  },
  reviewTherapistUpdate: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, reason } = req.body;
      const therapist = await reviewTherapistProfileUC.execute(req.params.id, status, reason);
      const mapped = therapist ? {
        ...therapist,
        id: (therapist as WithId<typeof therapist>)._id.toString(),
      } : null;
      res.json(ResponseModel.success(`Therapist profile update ${status}`, { therapist: mapped }));
    } catch (error) {
      next(error);
    }
  }
};
