import type { IUseCase } from "../IUseCase.js";
import type { PublicUserDTO } from "../../mappers/user.mapper.js";
import type { PublicTherapistDTO } from "../../mappers/therapist.mapper.js";
import type { UpdateUserStatusDTO, UpdateTherapistStatusDTO } from "../../dto/auth/admin.dto.js";

export interface IGetAllUsersUseCase extends IUseCase<void, PublicUserDTO[]> {}

export interface IGetAllTherapistsUseCase extends IUseCase<void, PublicTherapistDTO[]> {}

export interface IUpdateUserStatusUseCase extends IUseCase<{ id: string; dto: UpdateUserStatusDTO }, { id: string; status: string }> {}

export interface IUpdateTherapistStatusUseCase extends IUseCase<{ id: string; dto: UpdateTherapistStatusDTO }, { id: string; status: string }> {}
