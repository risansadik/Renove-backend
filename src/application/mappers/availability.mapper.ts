import type { TherapistAvailabilityEntity, TherapistSlotEntity } from "../../domain/entities/TherapistAvailability.entity.ts";
import type { IAvailabilityDocument, ISlotDocument } from "../../infrastructure/databases/schema/availability.schema.ts";

export class AvailabilityMapper {
  static toRuleEntity(doc: IAvailabilityDocument): TherapistAvailabilityEntity {
    return {
      id: doc._id.toString(),
      therapistId: doc.therapistId.toString(),
      title: doc.title,
      timezone: doc.timezone,
      startTime: doc.startTime,
      endTime: doc.endTime,
      recurrenceRule: doc.recurrenceRule,
      recurrenceType: doc.recurrenceType,
      startDate: doc.startDate,
      endDate: doc.endDate,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

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

  static toSlotEntity(doc: ISlotDocument): TherapistSlotEntity {
    return {
      id: doc._id.toString(),
      therapistId: doc.therapistId.toString(),
      availabilityId: doc.availabilityId?.toString(),
      startTime: doc.startTime,
      endTime: doc.endTime,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
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
