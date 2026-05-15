import type { IUseCase } from "../IUseCase.js";
import type { LoginUserDTO, RegisterUserDTO, VerifyOtpDTO, ResendOtpDTO, ForgotPasswordDTO, ResetPasswordDTO } from "../../dto/auth/user.dto.js";
import type { LoginTherapistDTO, RegisterTherapistDTO } from "../../dto/auth/therapist.dto.js";
import type { AdminLoginDTO } from "../../dto/auth/admin.dto.js";
import type { UserEntity } from "../../../domain/entities/User.entity.js";
import type { TherapistEntity } from "../../../domain/entities/Therapist.entity.js";
import type { AdminMapper } from "../../mappers/admin.mapper.js";

type PublicAdminDTO = ReturnType<typeof AdminMapper.toPublicDTO>;

export interface ILoginResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  user: UserEntity | TherapistEntity | PublicAdminDTO;
}

export interface IRegisterResponse {
  message: string;
  userId?: string;
  email?: string;
}

export interface ILoginUserUseCase extends IUseCase<LoginUserDTO | { idToken: string }, ILoginResponse> {}
export interface IRegisterUserUseCase extends IUseCase<RegisterUserDTO, IRegisterResponse | { email: string }> {}
export interface IVerifyOtpUseCase extends IUseCase<VerifyOtpDTO, void> {}
export interface IResendOtpUseCase extends IUseCase<{ dto: ResendOtpDTO; type?: "user" | "therapist" }, void> {}
export interface IForgotPasswordUseCase extends IUseCase<{ dto: ForgotPasswordDTO; type?: "user" | "therapist" }, void> {}
export interface IResetPasswordUseCase extends IUseCase<{ dto: ResetPasswordDTO; type?: "user" | "therapist" }, void> {}
export interface IVerifyResetOtpUseCase extends IUseCase<{ dto: VerifyOtpDTO; type?: "user" | "therapist" }, void> {}

export interface ILoginTherapistUseCase extends IUseCase<LoginTherapistDTO, ILoginResponse> {}
export interface IRegisterTherapistUseCase extends IUseCase<RegisterTherapistDTO, IRegisterResponse> {}

export interface IAdminLoginUseCase extends IUseCase<AdminLoginDTO, ILoginResponse> {}
