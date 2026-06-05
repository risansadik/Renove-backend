import type { TherapistAvailabilityEntity, TherapistSlotEntity } from "../../../domain/entities/TherapistAvailability.entity.ts";
import type { IUseCase } from "../IUseCase.ts";

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

export type ICreateAvailabilityUseCase = IUseCase<CreateAvailabilityDTO, TherapistAvailabilityEntity>;

export type IGetTherapistRulesUseCase = IUseCase<string, TherapistAvailabilityEntity[]>;

export type IGetAvailableSlotsUseCase = IUseCase<{ therapistId: string; startDate: Date; endDate: Date }, TherapistSlotEntity[]>;

export type IDeleteAvailabilityRuleUseCase = IUseCase<{ id: string; therapistId: string }, void>;

export type ILockSlotUseCase = IUseCase<{ slotId: string; userId: string }, { lockExpiresAt: Date }>;

export type IUnlockSlotUseCase = IUseCase<{ slotId: string; userId: string }, void>;
