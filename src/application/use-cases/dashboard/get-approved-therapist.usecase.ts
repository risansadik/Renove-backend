import { PaginationParams } from "../../../domain/interfaces/pagination.ts";
import { ITherapistRepository } from "../../../domain/repositories/therapist.repository.ts";
import { THERAPIST_STATUS } from "../../../shared/constants/index.ts";
import { TYPES } from "../../../shared/constants/tokens.ts";
import { IGetApprovedTherapistsUseCase } from "../../interfaces/dashboard/IDashboardUseCase.ts";
import { TherapistMapper } from "../../mappers/therapist.mapper.ts";
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
