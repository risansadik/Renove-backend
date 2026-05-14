import type { Request, Response, NextFunction } from "express";
import { RegisterTherapistUseCase } from "../../application/use-cases/auth/register-therapist.usecase.js";
import { VerifyTherapistOtpUseCase } from "../../application/use-cases/auth/verify-therapist-otp.usecase.js";
import { ResendOtpUseCase } from "../../application/use-cases/auth/resend-otp.usecase.js";
import { LoginTherapistUseCase } from "../../application/use-cases/auth/login-therapist.usecase.js";
import { ForgotPasswordUseCase } from "../../application/use-cases/auth/forgot-password.usecase.js";
import { VerifyResetOtpUseCase } from "../../application/use-cases/auth/verify-reset-otp.usecase.js";
import { ResetPasswordUseCase } from "../../application/use-cases/auth/reset-password.usecase.js";
import { TherapistRepository } from "../../infrastructure/repositories/therapist.repository.impl.js";
import { UserRepository } from "../../infrastructure/repositories/user.repository.impl.js";
import { ResponseModel } from "../../shared/utils/response-model.js";
import { setAuthCookies, clearAuthCookies } from "../../shared/utils/jwt.js";
import { HttpStatus } from "../../shared/constants/index.js";

const therapistRepo = new TherapistRepository();
const userRepo = new UserRepository();

const registerUC = new RegisterTherapistUseCase(therapistRepo);
const verifyOtpUC = new VerifyTherapistOtpUseCase(therapistRepo);
const resendOtpUC = new ResendOtpUseCase(userRepo, therapistRepo);
const loginUC = new LoginTherapistUseCase(therapistRepo);
const forgotPasswordUC = new ForgotPasswordUseCase(therapistRepo);
const verifyResetOtpUC = new VerifyResetOtpUseCase(therapistRepo);
const resetPasswordUC = new ResetPasswordUseCase(therapistRepo);

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
      await resendOtpUC.execute(req.body, "therapist");
      res.json(ResponseModel.success("OTP resent successfully", null));
    } catch (err) { next(err); }
  },

  login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tokens, therapist } = await loginUC.execute(req.body);
      setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
      res.json(ResponseModel.success("Login successful", { therapist }));
    } catch (err) { next(err); }
  },

  logout: (_req: Request, res: Response): void => {
    clearAuthCookies(res);
    res.json(ResponseModel.success("Logged out successfully", null));
  },
  
  forgotPassword: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await forgotPasswordUC.execute(req.body, "therapist");
      res.json(ResponseModel.success("Reset OTP sent to your email", null));
    } catch (err) { next(err); }
  },

  verifyResetOtp: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await verifyResetOtpUC.execute(req.body, "therapist");
      res.json(ResponseModel.success("OTP verified", null));
    } catch (err) { next(err); }
  },

  resetPassword: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await resetPasswordUC.execute(req.body, "therapist");
      res.json(ResponseModel.success("Password reset successful", null));
    } catch (err) { next(err); }
  },
};