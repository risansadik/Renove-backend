import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.ts";
import { THERAPIST_STATUS } from "../../../shared/constants/index.ts";
import { TherapistMapper } from "../../mappers/therapist.mapper.ts";

export class GetPendingTherapistUpdatesUseCase {
  constructor(private readonly _therapistRepo: ITherapistRepository) {}

  async execute() {
    const result = await this._therapistRepo.findByStatus(THERAPIST_STATUS.REVIEW_REQUIRED, {
      page: 1,
      limit: 100,
    });

    return TherapistMapper.toProfileDTOList(result.data);
  }
}
