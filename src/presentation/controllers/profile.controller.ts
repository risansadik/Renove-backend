import type { Response } from "express";
import { injectable, inject } from "inversify";
import type { GetPendingTherapistUpdatesUseCase } from "../../application/use-cases/admin/get-pending-therapist-updates.usecase.ts";
import type { ReviewTherapistProfileUseCase } from "../../application/use-cases/admin/review-therapist-profile.usecase.ts";
import type { ChangeAdminPasswordUseCase } from "../../application/use-cases/profile/change-admin-password.usecase.ts";
import type { ChangeTherapistPasswordUseCase } from "../../application/use-cases/profile/change-therapist-password.usecase.ts";
import type { ChangeUserPasswordUseCase } from "../../application/use-cases/profile/change-user-password.usecase.ts";
import type { GetAdminProfileUseCase } from "../../application/use-cases/profile/get-admin-profile.usecase.ts";
import type { GetTherapistProfileUseCase } from "../../application/use-cases/profile/get-therapist-profile.usecase.ts";
import type { GetUserProfileUseCase } from "../../application/use-cases/profile/get-user-profile.usecase.ts";
import type { UpdateAdminProfileUseCase } from "../../application/use-cases/profile/update-admin-profile.usecase.ts";
import type { UpdateTherapistProfileUseCase } from "../../application/use-cases/profile/update-therapist-profile.usecase.ts";
import type { UpdateUserProfileUseCase } from "../../application/use-cases/profile/update-user-profile.usecase.ts";
import { TYPES } from "../../shared/constants/tokens.ts";
import { MESSAGES } from "../../shared/constants/index.ts";
import type { AuthRequest, S3File } from "../../shared/types/express.ts";
import { ResponseModel } from "../../shared/utils/response-model.ts";
import { AppError } from "../../shared/utils/AppError.ts";

@injectable()
export class ProfileController {
  constructor(
    @inject(TYPES.GetUserProfileUseCase) private readonly _getUserProfileUC: GetUserProfileUseCase,
    @inject(TYPES.UpdateUserProfileUseCase) private readonly _updateUserProfileUC: UpdateUserProfileUseCase,
    @inject(TYPES.ChangeUserPasswordUseCase) private readonly _changeUserPasswordUC: ChangeUserPasswordUseCase,
    @inject(TYPES.GetTherapistProfileUseCase) private readonly _getTherapistProfileUC: GetTherapistProfileUseCase,
    @inject(TYPES.UpdateTherapistProfileUseCase) private readonly _updateTherapistProfileUC: UpdateTherapistProfileUseCase,
    @inject(TYPES.ChangeTherapistPasswordUseCase) private readonly _changeTherapistPasswordUC: ChangeTherapistPasswordUseCase,
    @inject(TYPES.GetAdminProfileUseCase) private readonly _getAdminProfileUC: GetAdminProfileUseCase,
    @inject(TYPES.UpdateAdminProfileUseCase) private readonly _updateAdminProfileUC: UpdateAdminProfileUseCase,
    @inject(TYPES.ChangeAdminPasswordUseCase) private readonly _changeAdminPasswordUC: ChangeAdminPasswordUseCase,
    @inject(TYPES.GetPendingTherapistUpdatesUseCase) private readonly _getPendingTherapistUpdatesUC: GetPendingTherapistUpdatesUseCase,
    @inject(TYPES.ReviewTherapistProfileUseCase) private readonly _reviewTherapistProfileUC: ReviewTherapistProfileUseCase
  ) {}

  public getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    const user = await this._getUserProfileUC.execute(req.user!.id);
    res.json(ResponseModel.success(MESSAGES.PROFILE.USER_FETCHED, { user }));
  };

  public updateUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    const updateData = {
      ...req.body,
    };

    if (req.file) {
      const s3File = req.file as unknown as S3File;
      updateData.profileImage = s3File.location;
    }

    const user = await this._updateUserProfileUC.execute(req.user!.id, updateData);
    res.json(ResponseModel.success(MESSAGES.PROFILE.USER_UPDATED, { user }));
  };

  public changeUserPassword = async (req: AuthRequest, res: Response): Promise<void> => {
    const { currentPassword, newPassword } = req.body;
    await this._changeUserPasswordUC.execute(req.user!.id, currentPassword, newPassword);
    res.json(ResponseModel.success(MESSAGES.PROFILE.PW_CHANGED, null));
  };

  public getTherapistProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    const therapist = await this._getTherapistProfileUC.execute(req.user!.id);
    res.json(ResponseModel.success(MESSAGES.PROFILE.THERAPIST_FETCHED, { therapist }));
  };

  public updateTherapistProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    const updateData = { ...req.body };
    const files = req.files as { [fieldname: string]: S3File[] | undefined } | undefined;

    if (files?.profileImage?.[0]) {
      updateData.profileImage = files.profileImage[0].location;
    }

    if (files?.certificationFiles) {
      updateData.certificationFiles = files.certificationFiles.map((file) => file.location);
    }

    const therapist = await this._updateTherapistProfileUC.execute(req.user!.id, updateData);
    res.json(ResponseModel.success(MESSAGES.PROFILE.THERAPIST_UPDATE_PROCESSED, { therapist }));
  };

  public changeTherapistPassword = async (req: AuthRequest, res: Response): Promise<void> => {
    const { currentPassword, newPassword } = req.body;
    await this._changeTherapistPasswordUC.execute(req.user!.id, currentPassword, newPassword);
    res.json(ResponseModel.success(MESSAGES.PROFILE.PW_CHANGED, null));
  };

  public getAdminProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    const admin = await this._getAdminProfileUC.execute(req.user!.id);
    res.json(ResponseModel.success(MESSAGES.PROFILE.ADMIN_FETCHED, { admin }));
  };

  public updateAdminProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    const updateData = {
      ...req.body,
    };

    if (req.file) {
      const s3File = req.file as unknown as S3File;
      updateData.profileImage = s3File.location;
    }

    const admin = await this._updateAdminProfileUC.execute(req.user!.id, updateData);
    res.json(ResponseModel.success(MESSAGES.PROFILE.ADMIN_UPDATED, { admin }));
  };

  public changeAdminPassword = async (req: AuthRequest, res: Response): Promise<void> => {
    const { currentPassword, newPassword } = req.body;
    await this._changeAdminPasswordUC.execute(req.user!.id, currentPassword, newPassword);
    res.json(ResponseModel.success(MESSAGES.PROFILE.PW_CHANGED, null));
  };

  public getPendingTherapistUpdates = async (_req: AuthRequest, res: Response): Promise<void> => {
    const therapists = await this._getPendingTherapistUpdatesUC.execute();
    res.json(ResponseModel.success(MESSAGES.PROFILE.PENDING_UPDATES_FETCHED, { therapists }));
  };

  public reviewTherapistUpdate = async (req: AuthRequest, res: Response): Promise<void> => {
    const { status, reason } = req.body;
    const therapist = await this._reviewTherapistProfileUC.execute(req.params.id, status, reason);
    res.json(ResponseModel.success(`Therapist profile update ${status}`, { therapist }));
  };
}
