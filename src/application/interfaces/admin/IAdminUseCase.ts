import type { IUseCase } from "../IUseCase.ts";
import type { PublicUserDTO } from "../../mappers/user.mapper.ts";
import type { PublicTherapistDTO } from "../../mappers/therapist.mapper.ts";
import type { UpdateUserStatusDTO, UpdateTherapistStatusDTO } from "../../dto/auth/admin.dto.ts";
import type { PaginationParams, PaginatedResult } from "../../../domain/interfaces/pagination.ts";

export type IGetAllUsersUseCase = IUseCase<PaginationParams, PaginatedResult<PublicUserDTO>>;

export type IGetAllTherapistsUseCase = IUseCase<PaginationParams, PaginatedResult<PublicTherapistDTO>>;

export type IUpdateUserStatusUseCase = IUseCase<{ id: string; dto: UpdateUserStatusDTO }, { id: string; status: string }>;

export type IUpdateTherapistStatusUseCase = IUseCase<{ id: string; dto: UpdateTherapistStatusDTO }, { id: string; status: string }>;
