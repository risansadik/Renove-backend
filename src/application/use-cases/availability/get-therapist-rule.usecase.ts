import type { IAvailabilityRepository} from "../../../domain/repositories/availability.repository.ts";
import type { IGetTherapistRulesUseCase} from "../../interfaces/availability/IAvailabilityUseCase.ts";
import type { TherapistAvailabilityEntity } from "../../../domain/entities/TherapistAvailability.entity.ts";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";

@injectable()
export class GetTherapistRulesUseCase implements IGetTherapistRulesUseCase {
  constructor(
    @inject(TYPES.AvailabilityRepository)private readonly _availabilityRepo: IAvailabilityRepository
  ) {}
  async execute(therapistId: string): Promise<TherapistAvailabilityEntity[]> {
    return await this._availabilityRepo.findByTherapistId(therapistId);
  }
}



