import type { IUseCase } from "../IUseCase.js";
import type { PublicUserDTO } from "../../mappers/user.mapper.js";
import type { PublicTherapistDTO } from "../../mappers/therapist.mapper.js";
import type { UpdateUserStatusDTO, UpdateTherapistStatusDTO } from "../../dto/auth/admin.dto.js";
import type { PaginationParams, PaginatedResult } from "../../../domain/interfaces/pagination.js";

export type IGetAllUsersUseCase = IUseCase<PaginationParams, PaginatedResult<PublicUserDTO>>;

export type IGetAllTherapistsUseCase = IUseCase<PaginationParams, PaginatedResult<PublicTherapistDTO>>;

export type IUpdateUserStatusUseCase = IUseCase<{ id: string; dto: UpdateUserStatusDTO }, { id: string; status: string }>;

export type IUpdateTherapistStatusUseCase = IUseCase<{ id: string; dto: UpdateTherapistStatusDTO }, { id: string; status: string }>;
