import type { IAvailabilityRepository, ISlotRepository } from "../../../domain/repositories/availability.repository.js";
import { SlotGenerator } from "../../../shared/utils/slot-generator.js";
import { addDays, startOfDay } from "date-fns";

import type { ICreateAvailabilityUseCase } from "../../interfaces/availability/IAvailabilityUseCase.js";

export interface CreateAvailabilityDTO {
  therapistId: string;
  title: string;
  startTime: string;
  endTime: string;
  recurrenceRule: string;
  recurrenceType: "weekly" | "once" | "daily";
  startDate: Date;
  endDate?: Date;
}

export class CreateAvailabilityUseCase implements ICreateAvailabilityUseCase {
  constructor(
    private availabilityRepo: IAvailabilityRepository,
    private slotRepo: ISlotRepository
  ) {}

  async execute(data: CreateAvailabilityDTO) {
    // 1. Create the availability rule
    const availability = await this.availabilityRepo.create({
      ...data,
      timezone: "UTC",
      isActive: true
    });

    // 2. Generate slots for the next 30 days
    const genStartDate = startOfDay(new Date());
    const genEndDate = addDays(genStartDate, 30);
    
    const slotsToCreate = SlotGenerator.generateSlots(
      data.recurrenceRule,
      genStartDate,
      genEndDate,
      data.startTime,
      data.endTime
    );

    // 3. Persist slots
    const slotEntities = slotsToCreate.map(slot => ({
      therapistId: data.therapistId,
      availabilityId: availability.id,
      startTime: slot.start,
      endTime: slot.end,
      status: "AVAILABLE" as const
    }));

    console.log(`[DEBUG] Generated ${slotEntities.length} slots for therapist ${data.therapistId}`);

    if (slotEntities.length > 0) {
      await this.slotRepo.createMany(slotEntities);
      console.log(`[DEBUG] Successfully persisted slots`);
    }

    return availability;
  }
}
