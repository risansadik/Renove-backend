import type { Request, Response } from "express";
import { injectable, inject } from "inversify";
import type {
  IForgotPasswordUseCase,
  ILoginTherapistUseCase,
  IRegisterTherapistUseCase,
  IResendOtpUseCase,
  IResetPasswordUseCase,
  IVerifyOtpUseCase,
  IVerifyResetOtpUseCase,
} from "../../application/interfaces/auth/IAuthUseCase";
import { HttpStatus, MESSAGES } from "../../shared/constants/index";
import { TYPES } from "../../shared/constants/tokens";
import { authTokenService } from "../../shared/utils/jwt";
import type { S3File } from "../../shared/types/express";
import { ResponseModel } from "../../shared/utils/response-model";

@injectable()
export class TherapistAuthController {
  constructor(
    @inject(TYPES.RegisterTherapistUseCase) private readonly _registerUC: IRegisterTherapistUseCase,
    @inject(TYPES.VerifyTherapistOtpUseCase) private readonly _verifyOtpUC: IVerifyOtpUseCase,
    @inject(TYPES.ResendOtpUseCase) private readonly _resendOtpUC: IResendOtpUseCase,
    @inject(TYPES.LoginTherapistUseCase) private readonly _loginUC: ILoginTherapistUseCase,
    @inject(TYPES.ForgotPasswordUseCase) private readonly _forgotPasswordUC: IForgotPasswordUseCase,
    @inject(TYPES.VerifyResetOtpUseCase) private readonly _verifyResetOtpUC: IVerifyResetOtpUseCase,
    @inject(TYPES.ResetPasswordUseCase) private readonly _resetPasswordUC: IResetPasswordUseCase
  ) {}

  public register = async (req: Request, res: Response): Promise<void> => {
    const files = req.files as { [fieldname: string]: S3File[] | undefined } | undefined;
    const profileImage = files?.profileImage?.[0]?.location;
    const certificationFiles = files?.certificationFiles?.map((file) => file.location) ?? [];

    const payload = {
      ...req.body,
      profileImage,
      certificationFiles,
      certifications: req.body.certifications ?? [],
    };

    const data = await this._registerUC.execute(payload);
    res.status(HttpStatus.CREATED).json(ResponseModel.created(MESSAGES.AUTH.THERAPIST_REGISTER_SUBMITTED, data));
  };

  public verifyOtp = async (req: Request, res: Response): Promise<void> => {
    await this._verifyOtpUC.execute(req.body);
    res.json(ResponseModel.success(MESSAGES.AUTH.THERAPIST_VERIFY_PENDING, null));
  };

  public resendOtp = async (req: Request, res: Response): Promise<void> => {
    await this._resendOtpUC.execute({ dto: req.body, type: "therapist" });
    res.json(ResponseModel.success(MESSAGES.AUTH.OTP_RESENT, null));
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    const { tokens, user } = await this._loginUC.execute(req.body);
    authTokenService.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    res.json(ResponseModel.success(MESSAGES.AUTH.LOGIN_SUCCESS, { therapist: user }));
  };

  public logout = (_req: Request, res: Response): void => {
    authTokenService.clearAuthCookies(res);
    res.json(ResponseModel.success(MESSAGES.AUTH.LOGOUT_SUCCESS, null));
  };

  public forgotPassword = async (req: Request, res: Response): Promise<void> => {
    await this._forgotPasswordUC.execute({ dto: req.body, type: "therapist" });
    res.json(ResponseModel.success(MESSAGES.AUTH.FORGOT_PW_SUCCESS, null));
  };

  public verifyResetOtp = async (req: Request, res: Response): Promise<void> => {
    await this._verifyResetOtpUC.execute({ dto: req.body, type: "therapist" });
    res.json(ResponseModel.success(MESSAGES.AUTH.VERIFY_SUCCESS, null));
  };

  public resetPassword = async (req: Request, res: Response): Promise<void> => {
    await this._resetPasswordUC.execute({ dto: req.body, type: "therapist" });
    res.json(ResponseModel.success(MESSAGES.AUTH.RESET_PW_SUCCESS, null));
  };
}
