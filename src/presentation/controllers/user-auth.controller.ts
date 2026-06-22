import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../shared/constants/tokens";

// Utilities
import { ResponseModel } from "../../shared/utils/response-model";
import { authTokenService } from "../../shared/utils/jwt";
import { HttpStatus, MESSAGES } from "../../shared/constants/index";

// Use Case Interfaces
import type { 
  IRegisterUserUseCase, 
  IVerifyOtpUseCase, 
  IResendOtpUseCase, 
  ILoginUserUseCase, 
  IGoogleAuthUseCase, 
  IForgotPasswordUseCase, 
  IResetPasswordUseCase, 
  IVerifyResetOtpUseCase, 
  IRefreshTokenUseCase 
} from "../../application/interfaces/auth/IAuthUseCase";

@injectable()
export class UserAuthController {
  constructor(
    @inject(TYPES.RegisterUserUseCase) private readonly _registerUC: IRegisterUserUseCase,
    @inject(TYPES.VerifyOtpUseCase) private readonly _verifyOtpUC: IVerifyOtpUseCase,
    @inject(TYPES.ResendOtpUseCase) private readonly _resendOtpUC: IResendOtpUseCase,
    @inject(TYPES.LoginUserUseCase) private readonly _loginUC: ILoginUserUseCase,
    @inject(TYPES.GoogleAuthUseCase) private readonly _googleAuthUC: IGoogleAuthUseCase,
    @inject(TYPES.ForgotPasswordUseCase) private readonly _forgotPasswordUC: IForgotPasswordUseCase,
    @inject(TYPES.ResetPasswordUseCase) private readonly _resetPasswordUC: IResetPasswordUseCase,
    @inject(TYPES.VerifyResetOtpUseCase) private readonly _verifyResetOtpUC: IVerifyResetOtpUseCase,
    @inject(TYPES.RefreshTokenUseCase) private readonly _refreshTokenUC: IRefreshTokenUseCase
  ) {}

  public register = async (req: Request, res: Response): Promise<void> => {
    const data = await this._registerUC.execute(req.body);
    res.status(HttpStatus.CREATED).json(ResponseModel.created(MESSAGES.AUTH.REGISTER_SUCCESS, data));
  };

  public verifyOtp = async (req: Request, res: Response): Promise<void> => {
    await this._verifyOtpUC.execute(req.body);
    res.json(ResponseModel.success(MESSAGES.AUTH.VERIFY_SUCCESS, null));
  };

  public resendOtp = async (req: Request, res: Response): Promise<void> => {
    await this._resendOtpUC.execute({ dto: req.body, type: "user" });
    res.json(ResponseModel.success(MESSAGES.AUTH.OTP_RESENT, null));
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    const { tokens, user } = await this._loginUC.execute(req.body);
    authTokenService.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    res.json(ResponseModel.success(MESSAGES.AUTH.LOGIN_SUCCESS, { user }));
  };

  public googleAuth = async (req: Request, res: Response): Promise<void> => {
    const { tokens, user } = await this._googleAuthUC.execute({ idToken: req.body.idToken });
    authTokenService.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    res.json(ResponseModel.success(MESSAGES.AUTH.GOOGLE_SUCCESS, { user }));
  };

  public forgotPassword = async (req: Request, res: Response): Promise<void> => {
    await this._forgotPasswordUC.execute({ dto: req.body, type: "user" });
    res.json(ResponseModel.success(MESSAGES.AUTH.FORGOT_PW_SUCCESS, null));
  };

  public resetPassword = async (req: Request, res: Response): Promise<void> => {
    await this._resetPasswordUC.execute({ dto: req.body, type: "user" });
    res.json(ResponseModel.success(MESSAGES.AUTH.RESET_PW_SUCCESS, null));
  };

  public verifyResetOtp = async (req: Request, res: Response): Promise<void> => {
    await this._verifyResetOtpUC.execute({ dto: req.body, type: "user" });
    res.json(ResponseModel.success(MESSAGES.AUTH.VERIFY_SUCCESS, null));
  };

  public logout = (_req: Request, res: Response): void => {
    authTokenService.clearAuthCookies(res);
    res.json(ResponseModel.success(MESSAGES.AUTH.LOGOUT_SUCCESS, null));
  };

  public refreshToken = async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies?.refreshToken;
    const tokens = await this._refreshTokenUC.execute(refreshToken);
    authTokenService.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    res.json(ResponseModel.success(MESSAGES.AUTH.TOKEN_REFRESHED, null));
  };
}
