import { PaginationParams } from "../../../domain/interfaces/pagination";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository";
import { THERAPIST_STATUS } from "../../../shared/constants/index";
import { TYPES } from "../../../shared/constants/tokens";
import { IGetApprovedTherapistsUseCase } from "../../interfaces/dashboard/IDashboardUseCase";
import { TherapistMapper } from "../../mappers/therapist.mapper";
import { injectable,inject } from "inversify";

@injectable()
export class GetApprovedTherapistsUseCase implements IGetApprovedTherapistsUseCase{
  constructor(
    @inject(TYPES.TherapistRepository)private readonly _therapistRepo: ITherapistRepository
) {}

  async execute(params: PaginationParams) {
    const result = await this._therapistRepo.findByStatus(THERAPIST_STATUS.APPROVED, params);

    return {
      data: result.data.map((therapist) => ({
        ...TherapistMapper.toPublicDTO(therapist),
        avatar: therapist.name.charAt(0).toUpperCase(),
      })),
      total: result.total,
    };
  }
}
