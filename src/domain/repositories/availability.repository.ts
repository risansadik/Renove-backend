import type { TherapistAvailabilityEntity, TherapistSlotEntity, SlotStatus } from "../../domain/entities/TherapistAvailability.entity";

export interface IAvailabilityRepository {
  create(data: TherapistAvailabilityEntity): Promise<TherapistAvailabilityEntity>;
  update(id: string, data: Partial<TherapistAvailabilityEntity>): Promise<TherapistAvailabilityEntity | null>;
  delete(id: string): Promise<boolean>;
  findById(id: string): Promise<TherapistAvailabilityEntity | null>;
  findByTherapistId(therapistId: string): Promise<TherapistAvailabilityEntity[]>;
}

export interface ISlotRepository {
  createMany(slots: TherapistSlotEntity[]): Promise<void>;
  findById(id: string): Promise<TherapistSlotEntity | null>;
  updateStatus(id: string, status: SlotStatus): Promise<TherapistSlotEntity | null>;
  findAvailable(therapistId: string, startDate: Date, endDate: Date): Promise<TherapistSlotEntity[]>;
  findByTherapistIdAndDateRange(therapistId: string, startDate: Date, endDate: Date): Promise<TherapistSlotEntity[]>;
  deleteByAvailabilityId(availabilityId: string): Promise<void>;
  lockSlot(slotId: string, userId: string, expiresAt: Date): Promise<boolean>;
  unlockSlot(slotId: string, userId: string): Promise<void>;
  releaseExpiredLocks(): Promise<void>;
}
