import { inject, injectable } from "inversify";
import type { ISlotRepository } from "../../../domain/repositories/availability.repository";
import { IGetAvailableSlotsUseCase } from "../../interfaces/availability/IAvailabilityUseCase";
import { TYPES } from "../../../shared/constants/tokens";
import { TherapistSlotEntity } from "../../../domain/entities/TherapistAvailability.entity";

@injectable()
export class GetAvailableSlotsUseCase implements IGetAvailableSlotsUseCase {
  constructor(
    @inject(TYPES.SlotRepository) private readonly _slotRepo: ISlotRepository
) {}
  async execute({ therapistId, startDate, endDate }: { therapistId: string; startDate: Date; endDate: Date }): Promise<TherapistSlotEntity[]> {
    return await this._slotRepo.findAvailable(therapistId, startDate, endDate);
  }
}
