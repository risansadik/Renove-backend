import type { IUseCase } from "../IUseCase.js";
import type { PublicUserDTO } from "../../mappers/user.mapper.js";
import type { PublicTherapistDTO } from "../../mappers/therapist.mapper.js";
import type { UpdateUserStatusDTO, UpdateTherapistStatusDTO } from "../../dto/auth/admin.dto.js";

export type IGetAllUsersUseCase = IUseCase<void, PublicUserDTO[]>;

export type IGetAllTherapistsUseCase = IUseCase<void, PublicTherapistDTO[]>;

export type IUpdateUserStatusUseCase = IUseCase<{ id: string; dto: UpdateUserStatusDTO }, { id: string; status: string }>;

export type IUpdateTherapistStatusUseCase = IUseCase<{ id: string; dto: UpdateTherapistStatusDTO }, { id: string; status: string }>;
