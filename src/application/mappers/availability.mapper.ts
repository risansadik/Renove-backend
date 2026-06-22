import type { TherapistAvailabilityEntity, TherapistSlotEntity } from "../../domain/entities/TherapistAvailability.entity";

export interface AvailabilityRuleDTO {
  id?: string;
  therapistId: string;
  title: string;
  timezone: string;
  startTime: string;
  endTime: string;
  recurrenceRule: string;
  recurrenceType: "weekly" | "once" | "daily";
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AvailabilitySlotDTO {
  id?: string;
  therapistId: string;
  availabilityId?: string;
  startTime: Date;
  endTime: Date;
  status: string;
}

export class AvailabilityMapper {
  static toRulePublicDTO(rule: TherapistAvailabilityEntity): AvailabilityRuleDTO {
    return {
      id: rule.id,
      therapistId: rule.therapistId,
      title: rule.title,
      timezone: rule.timezone,
      startTime: rule.startTime,
      endTime: rule.endTime,
      recurrenceRule: rule.recurrenceRule,
      recurrenceType: rule.recurrenceType,
      startDate: rule.startDate,
      endDate: rule.endDate,
      isActive: rule.isActive,
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt,
    };
  }

  static toRulePublicDTOList(rules: TherapistAvailabilityEntity[]): AvailabilityRuleDTO[] {
    return rules.map(r => this.toRulePublicDTO(r));
  }

  static toSlotPublicDTO(slot: TherapistSlotEntity): AvailabilitySlotDTO {
    return {
      id: slot.id,
      therapistId: slot.therapistId,
      availabilityId: slot.availabilityId,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: slot.status,
    };
  }

  static toSlotPublicDTOList(slots: TherapistSlotEntity[]): AvailabilitySlotDTO[] {
    return slots.map(s => this.toSlotPublicDTO(s));
  }
}
