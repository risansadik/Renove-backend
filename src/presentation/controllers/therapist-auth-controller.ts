import type { Request, Response, NextFunction } from "express";
import { RegisterTherapistUseCase } from "../../application/use-cases/auth/register-therapist.usecase.ts";
import { VerifyTherapistOtpUseCase } from "../../application/use-cases/auth/verify-therapist-otp.usecase.ts";
import { ResendOtpUseCase } from "../../application/use-cases/auth/resend-otp.usecase.ts";
import { LoginTherapistUseCase } from "../../application/use-cases/auth/login-therapist.usecase.ts";
import { ForgotPasswordUseCase } from "../../application/use-cases/auth/forgot-password.usecase.ts";
import { VerifyResetOtpUseCase } from "../../application/use-cases/auth/verify-reset-otp.usecase.ts";
import { ResetPasswordUseCase } from "../../application/use-cases/auth/reset-password.usecase.ts";
import { TherapistRepository } from "../../infrastructure/repositories/therapist.repository.impl.ts";
import { UserRepository } from "../../infrastructure/repositories/user.repository.impl.ts";
import { ResponseModel } from "../../shared/utils/response-model.ts";
import { setAuthCookies, clearAuthCookies } from "../../shared/utils/jwt.ts";
import { HttpStatus } from "../../shared/constants/index.ts";

import { TherapistMapper } from "../../application/mappers/therapist.mapper.ts";

const therapistRepo = new TherapistRepository();
const userRepo = new UserRepository();

const registerUC = new RegisterTherapistUseCase(therapistRepo);
const verifyOtpUC = new VerifyTherapistOtpUseCase(therapistRepo);
const resendOtpUC = new ResendOtpUseCase(userRepo, therapistRepo);
const loginUC = new LoginTherapistUseCase(therapistRepo);
const forgotPasswordUC = new ForgotPasswordUseCase(therapistRepo);
const verifyResetOtpUC = new VerifyResetOtpUseCase(therapistRepo);
const resetPasswordUC = new ResetPasswordUseCase(therapistRepo);

import { TherapistEntity } from "../../domain/entities/Therapist.entity.ts";

export const therapistAuthController = {
  register: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const profileImage = files?.profileImage?.[0]?.path;
      const certificationFiles = files?.certificationFiles?.map(f => f.path) || [];

      const payload = {
        ...req.body,
        profileImage,
        certificationFiles,
        certifications: req.body.certifications || []
      };

      console.log("THERAPIST REGISTRATION PAYLOAD:", payload);
      const data = await registerUC.execute(payload);
      res.status(HttpStatus.CREATED).json(ResponseModel.created("Registration submitted. Please verify your email.", data));
    } catch (err) { 
      console.error("THERAPIST REGISTRATION 500 ERROR:", err);
      next(err); 
    }
  },

  verifyOtp: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await verifyOtpUC.execute(req.body);
      res.json(ResponseModel.success("Email verified. Please wait for admin approval.", null));
    } catch (err) { next(err); }
  },

  resendOtp: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await resendOtpUC.execute({ dto: req.body, type: "therapist" });
      res.json(ResponseModel.success("OTP resent successfully", null));
    } catch (err) { next(err); }
  },

  login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tokens, user } = await loginUC.execute(req.body);
      setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
      res.json(ResponseModel.success("Login successful", { therapist: TherapistMapper.toPublicDTO(user as TherapistEntity) }));
    } catch (err) { next(err); }
  },

  logout: (_req: Request, res: Response): void => {
    clearAuthCookies(res);
    res.json(ResponseModel.success("Logged out successfully", null));
  },
  
  forgotPassword: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await forgotPasswordUC.execute({ dto: req.body, type: "therapist" });
      res.json(ResponseModel.success("Reset OTP sent to your email", null));
    } catch (err) { next(err); }
  },

  verifyResetOtp: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await verifyResetOtpUC.execute({ dto: req.body, type: "therapist" });
      res.json(ResponseModel.success("OTP verified", null));
    } catch (err) { next(err); }
  },

  resetPassword: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await resetPasswordUC.execute({ dto: req.body, type: "therapist" });
      res.json(ResponseModel.success("Password reset successful", null));
    } catch (err) { next(err); }
  },
};