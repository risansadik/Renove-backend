import type { IUseCase } from "../IUseCase.ts";
import type { UpdateAdminProfileDto } from "../../use-cases/profile/update-admin-profile.usecase.ts";
import type { PublicAdminDTO } from "../../mappers/admin.mapper.ts";
import type { PublicTherapistDTO } from "../../mappers/therapist.mapper.ts";
import type { PublicUserDTO } from "../../mappers/user.mapper.ts";

export interface UpdateUserProfileDto {
  name?: string;
  profileImage?: string;
}

export interface IUpdateUserProfileInput {
  userId: string;
  data: UpdateUserProfileDto;
}
export interface UpdateTherapistProfileDto {
  name?: string;
  profileImage?: string;
  qualification?: string;
  specialization?: string[];
  experience?: number;
  consultationFee?: number;
  bio?: string;
  certifications?: string[];
  certificationFiles?: string[];
}


export interface IUpdateTherapistProfileInput {
  therapistId: string;
  data: UpdateTherapistProfileDto;
}

export interface IUpdateAdminProfileInput {
  adminId: string;
  data: UpdateAdminProfileDto;
}

export interface IChangePasswordInput {
  id: string;
  currentPasswordRaw: string;
  newPasswordRaw: string;
}



export type IGetUserProfileUseCase = IUseCase<string, PublicUserDTO>;
export type IUpdateUserProfileUseCase = IUseCase<IUpdateUserProfileInput, PublicUserDTO>;
export type IChangeUserPasswordUseCase = IUseCase<IChangePasswordInput, boolean>;

export type IGetTherapistProfileUseCase = IUseCase<string, PublicTherapistDTO>;
export type IUpdateTherapistProfileUseCase = IUseCase<IUpdateTherapistProfileInput, PublicTherapistDTO | null>;
export type IChangeTherapistPasswordUseCase = IUseCase<IChangePasswordInput, boolean>;

export type IGetAdminProfileUseCase = IUseCase<string, PublicAdminDTO>;
export type IUpdateAdminProfileUseCase = IUseCase<IUpdateAdminProfileInput, PublicAdminDTO>;
export type IChangeAdminPasswordUseCase = IUseCase<IChangePasswordInput, boolean>;