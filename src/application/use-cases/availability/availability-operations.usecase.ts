import type { IAvailabilityRepository, ISlotRepository } from "../../../domain/repositories/availability.repository.js";
import type { IGetTherapistRulesUseCase, IGetAvailableSlotsUseCase, IDeleteAvailabilityRuleUseCase } from "../../interfaces/availability/IAvailabilityUseCase.js";
import type { TherapistAvailabilityEntity, TherapistSlotEntity } from "../../../domain/entities/TherapistAvailability.entity.js";

export class GetTherapistRulesUseCase implements IGetTherapistRulesUseCase {
  constructor(private availabilityRepo: IAvailabilityRepository) {}
  async execute(therapistId: string): Promise<TherapistAvailabilityEntity[]> {
    return await this.availabilityRepo.findByTherapistId(therapistId);
  }
}

export class GetAvailableSlotsUseCase implements IGetAvailableSlotsUseCase {
  constructor(private slotRepo: ISlotRepository) {}
  async execute({ therapistId, startDate, endDate }: { therapistId: string; startDate: Date; endDate: Date }): Promise<TherapistSlotEntity[]> {
    return await this.slotRepo.findAvailable(therapistId, startDate, endDate);
  }
}

export class DeleteAvailabilityRuleUseCase implements IDeleteAvailabilityRuleUseCase {
  constructor(
    private availabilityRepo: IAvailabilityRepository,
    private slotRepo: ISlotRepository
  ) {}
  async execute({ id, therapistId }: { id: string; therapistId: string }): Promise<void> {
    const rule = await this.availabilityRepo.findById(id);
    if (!rule || rule.therapistId !== therapistId) {
      throw new Error("Availability rule not found or unauthorized");
    }
    await this.availabilityRepo.delete(id);
    await this.slotRepo.deleteByAvailabilityId(id);
  }
}
