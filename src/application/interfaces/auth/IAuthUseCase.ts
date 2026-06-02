import type { IUseCase } from "../IUseCase.ts";
import type { LoginUserDTO, RegisterUserDTO, VerifyOtpDTO, ResendOtpDTO, ForgotPasswordDTO, ResetPasswordDTO } from "../../dto/auth/user.dto.ts";
import type { LoginTherapistDTO, RegisterTherapistDTO } from "../../dto/auth/therapist.dto.ts";
import type { AdminLoginDTO } from "../../dto/auth/admin.dto.ts";
import type { UserEntity } from "../../../domain/entities/User.entity.ts";
import type { TherapistEntity } from "../../../domain/entities/Therapist.entity.ts";
import type { AdminMapper } from "../../mappers/admin.mapper.ts";

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

// User Auth Use Cases
export type ILoginUserUseCase = IUseCase<LoginUserDTO, ILoginResponse>;
export type IGoogleAuthUseCase = IUseCase<{ idToken: string }, ILoginResponse>; // Added explicit contract
export type IRegisterUserUseCase = IUseCase<RegisterUserDTO, IRegisterResponse | { email: string }>;
export type IVerifyOtpUseCase = IUseCase<VerifyOtpDTO, void>;
export type IResendOtpUseCase = IUseCase<{ dto: ResendOtpDTO; type?: "user" | "therapist" }, void>;
export type IForgotPasswordUseCase = IUseCase<{ dto: ForgotPasswordDTO; type?: "user" | "therapist" }, void>;
export type IResetPasswordUseCase = IUseCase<{ dto: ResetPasswordDTO; type?: "user" | "therapist" }, void>;
export type IVerifyResetOtpUseCase = IUseCase<{ dto: VerifyOtpDTO; type?: "user" | "therapist" }, void>;
export type IRefreshTokenUseCase = IUseCase<string, { accessToken: string; refreshToken: string }>; // Added explicit contract

// Therapist Auth Use Cases
export type ILoginTherapistUseCase = IUseCase<LoginTherapistDTO, ILoginResponse>;
export type IRegisterTherapistUseCase = IUseCase<RegisterTherapistDTO, IRegisterResponse>;

// Admin Auth Use Cases
export type IAdminLoginUseCase = IUseCase<AdminLoginDTO, ILoginResponse>;