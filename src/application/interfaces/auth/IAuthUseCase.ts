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

export type ILoginUserUseCase = IUseCase<LoginUserDTO | { idToken: string }, ILoginResponse>;
export type IRegisterUserUseCase = IUseCase<RegisterUserDTO, IRegisterResponse | { email: string }>;
export type IVerifyOtpUseCase = IUseCase<VerifyOtpDTO, void>;
export type IResendOtpUseCase = IUseCase<{ dto: ResendOtpDTO; type?: "user" | "therapist" }, void>;
export type IForgotPasswordUseCase = IUseCase<{ dto: ForgotPasswordDTO; type?: "user" | "therapist" }, void>;
export type IResetPasswordUseCase = IUseCase<{ dto: ResetPasswordDTO; type?: "user" | "therapist" }, void>;
export type IVerifyResetOtpUseCase = IUseCase<{ dto: VerifyOtpDTO; type?: "user" | "therapist" }, void>;

export type ILoginTherapistUseCase = IUseCase<LoginTherapistDTO, ILoginResponse>;
export type IRegisterTherapistUseCase = IUseCase<RegisterTherapistDTO, IRegisterResponse>;

export type IAdminLoginUseCase = IUseCase<AdminLoginDTO, ILoginResponse>;
