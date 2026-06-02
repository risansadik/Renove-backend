import type { TherapistAvailabilityEntity, TherapistSlotEntity } from "../../domain/entities/TherapistAvailability.entity.ts";

export class AvailabilityMapper {
  static toRulePublicDTO(rule: TherapistAvailabilityEntity) {
    return {
      id: rule.id,
      therapistId: rule.therapistId,
      title: rule.title,
      startTime: rule.startTime,
      endTime: rule.endTime,
      recurrenceRule: rule.recurrenceRule,
      recurrenceType: rule.recurrenceType,
      isActive: rule.isActive
    };
  }

  static toRulePublicDTOList(rules: TherapistAvailabilityEntity[]) {
    return rules.map(r => this.toRulePublicDTO(r));
  }

  static toSlotPublicDTO(slot: TherapistSlotEntity) {
    return {
      id: slot.id,
      therapistId: slot.therapistId,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: slot.status
    };
  }

  static toSlotPublicDTOList(slots: TherapistSlotEntity[]) {
    return slots.map(s => this.toSlotPublicDTO(s));
  }
}
