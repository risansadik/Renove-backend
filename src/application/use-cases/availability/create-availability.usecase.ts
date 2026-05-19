import type { IAvailabilityRepository, ISlotRepository } from "../../../domain/repositories/availability.repository.js";
import { SlotGenerator } from "../../../shared/utils/slot-generator.js";
import { addDays, startOfDay } from "date-fns";
import { AppError } from "../../../shared/utils/AppError.js";
import { HttpStatus } from "../../../shared/constants/index.js";

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
  ) { }

  async execute(data: CreateAvailabilityDTO) {
    const genStartDate = startOfDay(new Date());
    const genEndDate = addDays(genStartDate, 30);

    // 1. Generate proposed slots
    const slotsToCreate = SlotGenerator.generateSlots(
      data.recurrenceRule,
      genStartDate,
      genEndDate,
      data.startTime,
      data.endTime
    );

    if (slotsToCreate.length === 0) {
      throw new AppError("No valid slots generated with the provided recurrence rule", HttpStatus.BAD_REQUEST);
    }

    // 2. Fetch existing slots for this therapist that fall in the range
    const existingSlots = await this.slotRepo.findByTherapistIdAndDateRange(
      data.therapistId,
      genStartDate,
      genEndDate
    );

    // Filter for active conflicting slots: AVAILABLE, RESERVED, BOOKED
    const conflictingStatuses = ["AVAILABLE", "RESERVED", "BOOKED"];
    const activeExistingSlots = existingSlots.filter(s => conflictingStatuses.includes(s.status));

    // 3. Validate against overlaps
    for (const proposed of slotsToCreate) {
      const proposedStart = proposed.start;
      const proposedEnd = proposed.end;

      const overlap = activeExistingSlots.find(existing => {
        return proposedStart < existing.endTime && proposedEnd > existing.startTime;
      });

      if (overlap) {
        const dateStr = proposedStart.toLocaleDateString(undefined, { dateStyle: "medium" });
        const timeStr = `${proposedStart.toLocaleTimeString(undefined, { timeStyle: "short" })} - ${proposedEnd.toLocaleTimeString(undefined, { timeStyle: "short" })}`;
        throw new AppError(
          `Cannot create availability: slot on ${dateStr} from ${timeStr} overlaps with an existing slot in your schedule.`,
          HttpStatus.BAD_REQUEST
        );
      }
    }

    // 4. Create availability if validation passes
    const availability = await this.availabilityRepo.create({
      ...data,
      timezone: "UTC",
      isActive: true
    });

    // 5. Persist slots
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
