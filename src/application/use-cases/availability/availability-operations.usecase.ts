import type { IAvailabilityRepository, ISlotRepository } from "../../../domain/repositories/availability.repository.ts";
import type { IGetTherapistRulesUseCase, IGetAvailableSlotsUseCase, IDeleteAvailabilityRuleUseCase } from "../../interfaces/availability/IAvailabilityUseCase.ts";
import type { TherapistAvailabilityEntity, TherapistSlotEntity } from "../../../domain/entities/TherapistAvailability.entity.ts";

export class GetTherapistRulesUseCase implements IGetTherapistRulesUseCase {
  constructor(private _availabilityRepo: IAvailabilityRepository) {}
  async execute(therapistId: string): Promise<TherapistAvailabilityEntity[]> {
    return await this._availabilityRepo.findByTherapistId(therapistId);
  }
}

export class GetAvailableSlotsUseCase implements IGetAvailableSlotsUseCase {
  constructor(private _slotRepo: ISlotRepository) {}
  async execute({ therapistId, startDate, endDate }: { therapistId: string; startDate: Date; endDate: Date }): Promise<TherapistSlotEntity[]> {
    return await this._slotRepo.findAvailable(therapistId, startDate, endDate);
  }
}

export class DeleteAvailabilityRuleUseCase implements IDeleteAvailabilityRuleUseCase {
  constructor(
    private _availabilityRepo: IAvailabilityRepository,
    private _slotRepo: ISlotRepository
  ) {}
  async execute({ id, therapistId }: { id: string; therapistId: string }): Promise<void> {
    const rule = await this._availabilityRepo.findById(id);
    if (!rule || rule.therapistId !== therapistId) {
      throw new Error("Availability rule not found or unauthorized");
    }
    await this._availabilityRepo.delete(id);
    await this._slotRepo.deleteByAvailabilityId(id);
  }
}
