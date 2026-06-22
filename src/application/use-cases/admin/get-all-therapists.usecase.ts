import { inject, injectable } from "inversify";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository";
import { TherapistMapper } from "../../mappers/therapist.mapper";

import type { IGetAllTherapistsUseCase } from "../../interfaces/admin/IAdminUseCase";
import type { PublicTherapistDTO } from "../../mappers/therapist.mapper";
import type { PaginationParams, PaginatedResult } from "../../../domain/interfaces/pagination";
import { TYPES } from "../../../shared/constants/tokens";


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
