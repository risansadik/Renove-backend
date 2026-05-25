import type { Request, Response, NextFunction } from "express";
import { RegisterUserUseCase } from "../../application/use-cases/auth/register-user.usecase.ts";
import { VerifyOtpUseCase } from "../../application/use-cases/auth/verify-otp.usecase.ts";
import { ResendOtpUseCase } from "../../application/use-cases/auth/resend-otp.usecase.ts";
import { LoginUserUseCase } from "../../application/use-cases/auth/login-user.usecase.ts";
import { GoogleAuthUseCase } from "../../application/use-cases/auth/google-auth.usecase.ts";
import { ForgotPasswordUseCase } from "../../application/use-cases/auth/forgot-password.usecase.ts";
import { ResetPasswordUseCase } from "../../application/use-cases/auth/reset-password.usecase.ts";
import { VerifyResetOtpUseCase } from "../../application/use-cases/auth/verify-reset-otp.usecase.ts";
import { UserRepository } from "../../infrastructure/repositories/user.repository.impl.ts";
import { TherapistRepository } from "../../infrastructure/repositories/therapist.repository.impl.ts";
import { ResponseModel } from "../../shared/utils/response-model.ts";
import { setAuthCookies, clearAuthCookies } from "../../shared/utils/jwt.ts";
import { HttpStatus } from "../../shared/constants/index.ts";
import { RefreshTokenUseCase } from "../../application/use-cases/auth/refresh-token.usecase.ts";


import { UserMapper } from "../../application/mappers/user.mapper.ts";

const userRepo = new UserRepository();
const therapistRepo = new TherapistRepository();

const registerUC = new RegisterUserUseCase(userRepo);
const verifyOtpUC = new VerifyOtpUseCase(userRepo);
const resendOtpUC = new ResendOtpUseCase(userRepo, therapistRepo);
const loginUC = new LoginUserUseCase(userRepo);
const googleAuthUC = new GoogleAuthUseCase(userRepo);
const forgotPasswordUC = new ForgotPasswordUseCase(userRepo);
const resetPasswordUC = new ResetPasswordUseCase(userRepo);
const verifyResetOtpUC = new VerifyResetOtpUseCase(userRepo);
const refreshTokenUC = new RefreshTokenUseCase(userRepo, therapistRepo);

import { UserEntity } from "../../domain/entities/User.entity.ts";

export const userAuthController = {
  register: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await registerUC.execute(req.body);
      res.status(HttpStatus.CREATED).json(ResponseModel.created("Registration successful. Please verify your email.", data));
    } catch (err) { next(err); }
  },

  verifyOtp: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await verifyOtpUC.execute(req.body);
      res.json(ResponseModel.success("Email verified successfully", null));
    } catch (err) { next(err); }
  },

  resendOtp: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await resendOtpUC.execute({ dto: req.body, type: "user" });
      res.json(ResponseModel.success("OTP resent successfully", null));
    } catch (err) { next(err); }
  },

  login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tokens, user } = await loginUC.execute(req.body);
      setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
      res.json(ResponseModel.success("Login successful", { user: UserMapper.toPublicDTO(user as UserEntity) }));
    } catch (err) { next(err); }
  },

  googleAuth: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tokens, user } = await googleAuthUC.execute({ idToken: req.body.idToken });
      setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
      res.json(ResponseModel.success("Google authentication successful", { user: UserMapper.toPublicDTO(user as UserEntity) }));
    } catch (err) { next(err); }
  },

  forgotPassword: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await forgotPasswordUC.execute({ dto: req.body, type: "user" });
      res.json(ResponseModel.success("Password reset OTP sent to your email", null));
    } catch (err) { next(err); }
  },

  resetPassword: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await resetPasswordUC.execute({ dto: req.body, type: "user" });
      res.json(ResponseModel.success("Password reset successful", null));
    } catch (err) { next(err); }
  },

  verifyResetOtp: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await verifyResetOtpUC.execute({ dto: req.body, type: "user" });
      res.json(ResponseModel.success("OTP verified successfully", null));
    } catch (err) { next(err); }
  },

  logout: (_req: Request, res: Response): void => {
    clearAuthCookies(res);
    res.json(ResponseModel.success("Logged out successfully", null));
  },

  refreshToken: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      const tokens = await refreshTokenUC.execute(refreshToken);
      setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
      res.json(ResponseModel.success("Token refreshed successfully", null));
    } catch (err) { next(err); }
  },
};