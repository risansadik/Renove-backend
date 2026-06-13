import type { IAvailabilityDocument, ISlotDocument } from "../databases/schema/availability.schema.ts";
import type { TherapistAvailabilityEntity, TherapistSlotEntity } from "../../domain/entities/TherapistAvailability.entity.ts";

export class AvailabilityDbMapper {
  static toAvailabilityEntity(doc: IAvailabilityDocument): TherapistAvailabilityEntity {
    const obj = doc.toObject ? doc.toObject() : doc;
    return {
      id: obj._id.toString(),
      therapistId: obj.therapistId.toString(),
      title: obj.title,
      timezone: obj.timezone,
      startTime: obj.startTime,
      endTime: obj.endTime,
      recurrenceRule: obj.recurrenceRule,
      recurrenceType: obj.recurrenceType,
      startDate: obj.startDate,
      endDate: obj.endDate,
      isActive: obj.isActive,
    };
  }

  static toSlotEntity(doc: ISlotDocument): TherapistSlotEntity {
    const obj = doc.toObject ? doc.toObject() : doc;
    return {
      id: obj._id.toString(),
      therapistId: obj.therapistId.toString(),
      availabilityId: obj.availabilityId.toString(),
      startTime: obj.startTime,
      endTime: obj.endTime,
      status: obj.status,
    };
  }
}
