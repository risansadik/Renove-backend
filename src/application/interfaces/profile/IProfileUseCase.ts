import type { UpdateUserProfileDto } from "../../use-cases/profile/update-user-profile.usecase.ts";
import type { UpdateTherapistProfileDto } from "../../use-cases/profile/update-therapist-profile.usecase.ts";
import type { UpdateAdminProfileDto } from "../../use-cases/profile/update-admin-profile.usecase.ts";
import type { PublicAdminDTO } from "../../mappers/admin.mapper.ts";
import type { PublicTherapistDTO } from "../../mappers/therapist.mapper.ts";
import type { PublicUserDTO } from "../../mappers/user.mapper.ts";

export interface IGetUserProfileUseCase {
  execute(userId: string): Promise<PublicUserDTO>;
}

export interface IUpdateUserProfileUseCase {
  execute(userId: string, data: UpdateUserProfileDto): Promise<PublicUserDTO>;
}

export interface IChangeUserPasswordUseCase {
  execute(userId: string, currentPasswordRaw: string, newPasswordRaw: string): Promise<boolean>;
}

export interface IGetTherapistProfileUseCase {
  execute(therapistId: string): Promise<PublicTherapistDTO>;
}

export interface IUpdateTherapistProfileUseCase {
  execute(therapistId: string, data: UpdateTherapistProfileDto): Promise<PublicTherapistDTO | null>;
}

export interface IChangeTherapistPasswordUseCase {
  execute(therapistId: string, currentPasswordRaw: string, newPasswordRaw: string): Promise<boolean>;
}

export interface IGetAdminProfileUseCase {
  execute(adminId: string): Promise<PublicAdminDTO>;
}

export interface IUpdateAdminProfileUseCase {
  execute(adminId: string, data: UpdateAdminProfileDto): Promise<PublicAdminDTO>;
}

export interface IChangeAdminPasswordUseCase {
  execute(adminId: string, currentPasswordRaw: string, newPasswordRaw: string): Promise<boolean>;
}
