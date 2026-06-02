import { inject, injectable } from "inversify";
import { ISlotRepository } from "../../../domain/repositories/availability.repository.ts";
import { IGetAvailableSlotsUseCase } from "../../interfaces/availability/IAvailabilityUseCase.ts";
import { TYPES } from "../../../shared/constants/tokens.ts";
import { TherapistSlotEntity } from "../../../domain/entities/TherapistAvailability.entity.ts";

@injectable()
export class GetAvailableSlotsUseCase implements IGetAvailableSlotsUseCase {
  constructor(
    @inject(TYPES.SlotRepository) private readonly _slotRepo: ISlotRepository
) {}
  async execute({ therapistId, startDate, endDate }: { therapistId: string; startDate: Date; endDate: Date }): Promise<TherapistSlotEntity[]> {
    return await this._slotRepo.findAvailable(therapistId, startDate, endDate);
  }
}
