import type { Container } from "inversify";
import type {
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
import { AdminLoginUseCase } from "../../../application/use-cases/auth/admin-login.usecase.ts";
import { ForgotPasswordUseCase } from "../../../application/use-cases/auth/forgot-password.usecase.ts";
import { GoogleAuthUseCase } from "../../../application/use-cases/auth/google-auth.usecase.ts";
import { LoginTherapistUseCase } from "../../../application/use-cases/auth/login-therapist.usecase.ts";
import { LoginUserUseCase } from "../../../application/use-cases/auth/login-user.usecase.ts";
import { RefreshTokenUseCase } from "../../../application/use-cases/auth/refresh-token.usecase.ts";
import { RegisterTherapistUseCase } from "../../../application/use-cases/auth/register-therapist.usecase.ts";
import { RegisterUserUseCase } from "../../../application/use-cases/auth/register-user.usecase.ts";
import { ResendOtpUseCase } from "../../../application/use-cases/auth/resend-otp.usecase.ts";
import { ResetPasswordUseCase } from "../../../application/use-cases/auth/reset-password.usecase.ts";
import { VerifyOtpUseCase } from "../../../application/use-cases/auth/verify-otp.usecase.ts";
import { VerifyResetOtpUseCase } from "../../../application/use-cases/auth/verify-reset-otp.usecase.ts";
import { VerifyTherapistOtpUseCase } from "../../../application/use-cases/auth/verify-therapist-otp.usecase.ts";
import { AdminController } from "../../../presentation/controllers/admin.controller.ts";
import { TherapistAuthController } from "../../../presentation/controllers/therapist-auth-controller.ts";
import { UserAuthController } from "../../../presentation/controllers/user-auth.controller.ts";
import { TYPES } from "../../../shared/constants/tokens.ts";

export const registerAuthModule = (container: Container): void => {
  container.bind(TYPES.AdminLoginUseCase).to(AdminLoginUseCase);
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
