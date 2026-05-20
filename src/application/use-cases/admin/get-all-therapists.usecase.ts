import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.js";
import { TherapistMapper } from "../../mappers/therapist.mapper.js";

import type { IGetAllTherapistsUseCase } from "../../interfaces/admin/IAdminUseCase.js";
import type { PublicTherapistDTO } from "../../mappers/therapist.mapper.js";
import type { PaginationParams, PaginatedResult } from "../../../domain/interfaces/pagination.js";

export class GetAllTherapistsUseCase implements IGetAllTherapistsUseCase {
  constructor(private readonly _therapistRepo: ITherapistRepository) {}

  async execute(params: PaginationParams): Promise<PaginatedResult<PublicTherapistDTO>> {
    const result = await this._therapistRepo.findAll(params);
    return {
      data: result.data.map(TherapistMapper.toPublicDTO),
      total: result.total
    };
  }
}
