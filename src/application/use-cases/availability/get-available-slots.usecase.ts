import { inject, injectable } from "inversify";
import type { IAvailabilityRepository, ISlotRepository } from "../../../domain/repositories/availability.repository";
import { IGetAvailableSlotsUseCase } from "../../interfaces/availability/IAvailabilityUseCase";
import { TYPES } from "../../../shared/constants/tokens";
import { TherapistSlotEntity } from "../../../domain/entities/TherapistAvailability.entity";
import { SlotGenerator } from "../../../shared/utils/slot-generator";
import { addDays, startOfDay, isBefore } from "date-fns";

@injectable()
export class GetAvailableSlotsUseCase implements IGetAvailableSlotsUseCase {
  constructor(
    @inject(TYPES.SlotRepository) private readonly _slotRepo: ISlotRepository,
    @inject(TYPES.AvailabilityRepository) private readonly _availabilityRepo: IAvailabilityRepository
  ) {}

  async execute({ therapistId, startDate, endDate }: { therapistId: string; startDate: Date; endDate: Date }): Promise<TherapistSlotEntity[]> {
    await this._syncFutureSlots(therapistId, startDate, endDate);
    return await this._slotRepo.findAvailable(therapistId, startDate, endDate);
  }

  private async _syncFutureSlots(therapistId: string, startDate: Date, endDate: Date): Promise<void> {
    const rules = await this._availabilityRepo.findByTherapistId(therapistId);
    const activeRules = rules.filter(r => r.isActive);
    if (activeRules.length === 0) return;

    const now = new Date();
    const windowStart = startOfDay(isBefore(startDate, now) ? startDate : now);
    const defaultEnd = addDays(windowStart, 30);
    const windowEnd = defaultEnd > endDate ? defaultEnd : addDays(endDate, 7);

    // Fetch existing slots in window to avoid duplicating or conflicting
    const existingSlots = await this._slotRepo.findByTherapistIdAndDateRange(
      therapistId,
      windowStart,
      windowEnd
    );
    const existingTimeSet = new Set(existingSlots.map(s => s.startTime.getTime()));

    const slotsToCreate: TherapistSlotEntity[] = [];

    for (const rule of activeRules) {
      const ruleEnd = rule.endDate && rule.endDate < windowEnd ? rule.endDate : windowEnd;
      if (ruleEnd < windowStart) continue;

      const generated = SlotGenerator.generateSlots(
        rule.recurrenceRule,
        windowStart,
        ruleEnd,
        rule.startTime,
        rule.endTime
      );

      for (const slot of generated) {
        const timeKey = slot.start.getTime();
        if (!existingTimeSet.has(timeKey)) {
          existingTimeSet.add(timeKey);
          slotsToCreate.push({
            therapistId,
            availabilityId: rule.id!,
            startTime: slot.start,
            endTime: slot.end,
            status: "AVAILABLE",
          });
        }
      }
    }

    if (slotsToCreate.length > 0) {
      await this._slotRepo.createMany(slotsToCreate);
    }
  }
}
