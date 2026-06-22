import { inject, injectable } from "inversify";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository";
import { THERAPIST_STATUS } from "../../../shared/constants/index";
import { IGetPendingTherapistUpdatesUseCase } from "../../interfaces/admin/IAdminUseCase";
import { PublicTherapistDTO, TherapistMapper } from "../../mappers/therapist.mapper";
import { TYPES } from "../../../shared/constants/tokens";

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
