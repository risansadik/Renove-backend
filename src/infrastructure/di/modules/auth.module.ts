import type { Container } from "inversify";
import type {
  IAdminLoginUseCase,
  IForgotPasswordUseCase,
  IGoogleAuthUseCase,
  ILoginTherapistUseCase,
  ILoginUserUseCase,
  IRefreshTokenUseCase,
  IRegisterTherapistUseCase,
  IRegisterUserUseCase,
  IResendOtpUseCase,
  IResetPasswordUseCase,
  IVerifyOtpUseCase,
  IVerifyResetOtpUseCase,
} from "../../../application/interfaces/auth/IAuthUseCase.ts";
import { AdminController } from "../../../presentation/controllers/admin.controller.ts";
import { TherapistAuthController } from "../../../presentation/controllers/therapist-auth-controller.ts";
import { UserAuthController } from "../../../presentation/controllers/user-auth.controller.ts";

import {
  AdminLoginUseCase,
  ForgotPasswordUseCase,
  GoogleAuthUseCase,
  LoginTherapistUseCase,
  LoginUserUseCase,
  RefreshTokenUseCase,
  RegisterTherapistUseCase,
  RegisterUserUseCase,
  ResendOtpUseCase,
  ResetPasswordUseCase,
  VerifyOtpUseCase,
  VerifyResetOtpUseCase,
  VerifyTherapistOtpUseCase
} from '../../../application/use-cases/auth/auth.usecase.ts'
import { TYPES } from "../../../shared/constants/tokens.ts";

export const registerAuthModule = (container: Container): void => {
  container.bind<IAdminLoginUseCase>(TYPES.AdminLoginUseCase).to(AdminLoginUseCase);
  container.bind<IForgotPasswordUseCase>(TYPES.ForgotPasswordUseCase).to(ForgotPasswordUseCase);
  container.bind<IGoogleAuthUseCase>(TYPES.GoogleAuthUseCase).to(GoogleAuthUseCase);
  container.bind<ILoginTherapistUseCase>(TYPES.LoginTherapistUseCase).to(LoginTherapistUseCase);
  container.bind<ILoginUserUseCase>(TYPES.LoginUserUseCase).to(LoginUserUseCase);
  container.bind<IRefreshTokenUseCase>(TYPES.RefreshTokenUseCase).to(RefreshTokenUseCase);
  container.bind<IRegisterTherapistUseCase>(TYPES.RegisterTherapistUseCase).to(RegisterTherapistUseCase);
  container.bind<IRegisterUserUseCase>(TYPES.RegisterUserUseCase).to(RegisterUserUseCase);
  container.bind<IResendOtpUseCase>(TYPES.ResendOtpUseCase).to(ResendOtpUseCase);
  container.bind<IResetPasswordUseCase>(TYPES.ResetPasswordUseCase).to(ResetPasswordUseCase);
  container.bind<IVerifyOtpUseCase>(TYPES.VerifyOtpUseCase).to(VerifyOtpUseCase);
  container.bind<IVerifyResetOtpUseCase>(TYPES.VerifyResetOtpUseCase).to(VerifyResetOtpUseCase);
  container.bind<IVerifyOtpUseCase>(TYPES.VerifyTherapistOtpUseCase).to(VerifyTherapistOtpUseCase);

  container.bind<AdminController>(TYPES.AdminController).to(AdminController).inSingletonScope();
  container.bind<TherapistAuthController>(TYPES.TherapistAuthController).to(TherapistAuthController).inSingletonScope();
  container.bind<UserAuthController>(TYPES.UserAuthController).to(UserAuthController).inSingletonScope();
};
