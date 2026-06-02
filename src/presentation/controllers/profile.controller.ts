import type { Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../shared/constants/tokens.ts";
import { MESSAGES } from "../../shared/constants/index.ts";
import type { AuthRequest, S3File } from "../../shared/types/express.ts";
import { ResponseModel } from "../../shared/utils/response-model.ts";

// 1. Dependency Inversion: Reference application interface contracts
import type {
  IGetUserProfileUseCase,
  IUpdateUserProfileUseCase,
  IChangeUserPasswordUseCase,
  IGetTherapistProfileUseCase,
  IUpdateTherapistProfileUseCase,
  IChangeTherapistPasswordUseCase,
  IGetAdminProfileUseCase,
  IUpdateAdminProfileUseCase,
  IChangeAdminPasswordUseCase
} from "../../application/interfaces/profile/IProfileUseCase.ts";

// Assuming these follow your standardized interface structures as well
interface IGetPendingTherapistUpdatesUseCase { execute(): Promise<any>; }
interface IReviewTherapistProfileUseCase { execute(input: { therapistId: string; status: string; reason?: string }): Promise<any>; }

@injectable()
export class ProfileController {
  constructor(
    @inject(TYPES.GetUserProfileUseCase) private readonly _getUserProfileUC: IGetUserProfileUseCase,
    @inject(TYPES.UpdateUserProfileUseCase) private readonly _updateUserProfileUC: IUpdateUserProfileUseCase,
    @inject(TYPES.ChangeUserPasswordUseCase) private readonly _changeUserPasswordUC: IChangeUserPasswordUseCase,
    @inject(TYPES.GetTherapistProfileUseCase) private readonly _getTherapistProfileUC: IGetTherapistProfileUseCase,
    @inject(TYPES.UpdateTherapistProfileUseCase) private readonly _updateTherapistProfileUC: IUpdateTherapistProfileUseCase,
    @inject(TYPES.ChangeTherapistPasswordUseCase) private readonly _changeTherapistPasswordUC: IChangeTherapistPasswordUseCase,
    @inject(TYPES.GetAdminProfileUseCase) private readonly _getAdminProfileUC: IGetAdminProfileUseCase,
    @inject(TYPES.UpdateAdminProfileUseCase) private readonly _updateAdminProfileUC: IUpdateAdminProfileUseCase,
    @inject(TYPES.ChangeAdminPasswordUseCase) private readonly _changeAdminPasswordUC: IChangeAdminPasswordUseCase,
    @inject(TYPES.GetPendingTherapistUpdatesUseCase) private readonly _getPendingTherapistUpdatesUC: IGetPendingTherapistUpdatesUseCase,
    @inject(TYPES.ReviewTherapistProfileUseCase) private readonly _reviewTherapistProfileUC: IReviewTherapistProfileUseCase
  ) { }

  public getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    // Single primitive string value is valid for this usecase interface
    const user = await this._getUserProfileUC.execute(req.user!.id);
    res.json(ResponseModel.success(MESSAGES.PROFILE.USER_FETCHED, { user }));
  };

  public updateUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    const updateData = { ...req.body };

    if (req.file) {
      const s3File = req.file as unknown as S3File;
      updateData.profileImage = s3File.location;
    }


    const user = await this._updateUserProfileUC.execute({ userId: req.user!.id, data: updateData });
    res.json(ResponseModel.success(MESSAGES.PROFILE.USER_UPDATED, { user }));
  };

  public changeUserPassword = async (req: AuthRequest, res: Response): Promise<void> => {
    const { currentPassword, newPassword } = req.body;


    await this._changeUserPasswordUC.execute({
      id: req.user!.id,
      currentPasswordRaw: currentPassword,
      newPasswordRaw: newPassword
    });

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


    const therapist = await this._updateTherapistProfileUC.execute({ therapistId: req.user!.id, data: updateData });
    res.json(ResponseModel.success(MESSAGES.PROFILE.THERAPIST_UPDATE_PROCESSED, { therapist }));
  };

  public changeTherapistPassword = async (req: AuthRequest, res: Response): Promise<void> => {
    const { currentPassword, newPassword } = req.body;

    await this._changeTherapistPasswordUC.execute({
      id: req.user!.id,
      currentPasswordRaw: currentPassword,
      newPasswordRaw: newPassword
    });

    res.json(ResponseModel.success(MESSAGES.PROFILE.PW_CHANGED, null));
  };

  public getAdminProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    const admin = await this._getAdminProfileUC.execute(req.user!.id);
    res.json(ResponseModel.success(MESSAGES.PROFILE.ADMIN_FETCHED, { admin }));
  };

  public updateAdminProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    const updateData = { ...req.body };

    if (req.file) {
      const s3File = req.file as unknown as S3File;
      updateData.profileImage = s3File.location;
    }


    const admin = await this._updateAdminProfileUC.execute({ adminId: req.user!.id, data: updateData });
    res.json(ResponseModel.success(MESSAGES.PROFILE.ADMIN_UPDATED, { admin }));
  };

  public changeAdminPassword = async (req: AuthRequest, res: Response): Promise<void> => {
    const { currentPassword, newPassword } = req.body;


    await this._changeAdminPasswordUC.execute({
      id: req.user!.id,
      currentPasswordRaw: currentPassword,
      newPasswordRaw: newPassword
    });

    res.json(ResponseModel.success(MESSAGES.PROFILE.PW_CHANGED, null));
  };

  public getPendingTherapistUpdates = async (_req: AuthRequest, res: Response): Promise<void> => {
    const therapists = await this._getPendingTherapistUpdatesUC.execute();
    res.json(ResponseModel.success(MESSAGES.PROFILE.PENDING_UPDATES_FETCHED, { therapists }));
  };

  public reviewTherapistUpdate = async (req: AuthRequest, res: Response): Promise<void> => {
    const { status, reason } = req.body;


    const therapist = await this._reviewTherapistProfileUC.execute({
      therapistId: req.params.id,
      status,
      reason
    });

    res.json(ResponseModel.success(`Therapist profile update ${status}`, { therapist }));
  };
}