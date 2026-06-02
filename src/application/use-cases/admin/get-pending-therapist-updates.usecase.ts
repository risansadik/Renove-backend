import { inject, injectable } from "inversify";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.ts";
import { THERAPIST_STATUS } from "../../../shared/constants/index.ts";
import { IGetPendingTherapistUpdatesUseCase } from "../../interfaces/admin/IAdminUseCase.ts";
import { PublicTherapistDTO, TherapistMapper } from "../../mappers/therapist.mapper.ts";
import { TYPES } from "../../../shared/constants/tokens.ts";

@injectable()
export class GetPendingTherapistUpdatesUseCase implements IGetPendingTherapistUpdatesUseCase{
  constructor(
    @inject(TYPES.TherapistRepository) private readonly _therapistRepo: ITherapistRepository) {}

  async execute() :Promise<PublicTherapistDTO[]> {
    const result = await this._therapistRepo.findByStatus(THERAPIST_STATUS.REVIEW_REQUIRED, {
      page: 1,
      limit: 100,
    });

    return TherapistMapper.toProfileDTOList(result.data);
  }
}
