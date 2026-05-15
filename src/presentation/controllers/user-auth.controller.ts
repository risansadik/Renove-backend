import type { Request, Response, NextFunction } from "express";
import { RegisterUserUseCase } from "../../application/use-cases/auth/register-user.usecase.js";
import { VerifyOtpUseCase } from "../../application/use-cases/auth/verify-otp.usecase.js";
import { ResendOtpUseCase } from "../../application/use-cases/auth/resend-otp.usecase.js";
import { LoginUserUseCase } from "../../application/use-cases/auth/login-user.usecase.js";
import { GoogleAuthUseCase } from "../../application/use-cases/auth/google-auth.usecase.js";
import { ForgotPasswordUseCase } from "../../application/use-cases/auth/forgot-password.usecase.js";
import { ResetPasswordUseCase } from "../../application/use-cases/auth/reset-password.usecase.js";
import { VerifyResetOtpUseCase } from "../../application/use-cases/auth/verify-reset-otp.usecase.js";
import { UserRepository } from "../../infrastructure/repositories/user.repository.impl.js";
import { TherapistRepository } from "../../infrastructure/repositories/therapist.repository.impl.js";
import { ResponseModel } from "../../shared/utils/response-model.js";
import { setAuthCookies, clearAuthCookies } from "../../shared/utils/jwt.js";
import { HttpStatus } from "../../shared/constants/index.js";


import { UserMapper } from "../../application/mappers/user.mapper.js";

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

import { UserEntity } from "../../domain/entities/User.entity.js";

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
};