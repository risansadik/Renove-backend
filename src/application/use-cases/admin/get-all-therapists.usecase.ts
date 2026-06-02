import { inject, injectable } from "inversify";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.ts";
import { TherapistMapper } from "../../mappers/therapist.mapper.ts";

import type { IGetAllTherapistsUseCase } from "../../interfaces/admin/IAdminUseCase.ts";
import type { PublicTherapistDTO } from "../../mappers/therapist.mapper.ts";
import type { PaginationParams, PaginatedResult } from "../../../domain/interfaces/pagination.ts";
import { TYPES } from "../../../shared/constants/tokens.ts";


@injectable()
export class GetAllTherapistsUseCase implements IGetAllTherapistsUseCase {
  constructor(
    @inject(TYPES.TherapistRepository) private readonly _therapistRepo: ITherapistRepository
  ) {}

  async execute(params: PaginationParams): Promise<PaginatedResult<PublicTherapistDTO>> {
    const result = await this._therapistRepo.findAll(params);
    return {
      data: result.data.map(TherapistMapper.toPublicDTO),
      total: result.total
    };
  }
}
