import type { IAvailabilityRepository} from "../../../domain/repositories/availability.repository";
import type { IGetTherapistRulesUseCase} from "../../interfaces/availability/IAvailabilityUseCase";
import type { TherapistAvailabilityEntity } from "../../../domain/entities/TherapistAvailability.entity";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/constants/tokens";

@injectable()
export class GetTherapistRulesUseCase implements IGetTherapistRulesUseCase {
  constructor(
    @inject(TYPES.AvailabilityRepository)private readonly _availabilityRepo: IAvailabilityRepository
  ) {}
  async execute(therapistId: string): Promise<TherapistAvailabilityEntity[]> {
    return await this._availabilityRepo.findByTherapistId(therapistId);
  }
}



