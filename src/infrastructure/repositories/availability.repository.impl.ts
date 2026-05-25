import { AvailabilityModel, SlotModel, type IAvailabilityDocument, type ISlotDocument } from "../databases/schema/availability.schema.ts";
import type { IAvailabilityRepository, ISlotRepository } from "../../domain/repositories/availability.repository.ts";
import type { TherapistAvailabilityEntity, TherapistSlotEntity, SlotStatus } from "../../domain/entities/TherapistAvailability.entity.ts";

export class AvailabilityRepository implements IAvailabilityRepository {
  private _toAvailabilityEntity(doc: IAvailabilityDocument): TherapistAvailabilityEntity {
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

  async create(data: TherapistAvailabilityEntity): Promise<TherapistAvailabilityEntity> {
    const created = await AvailabilityModel.create(data);
    return this._toAvailabilityEntity(created);
  }

  async update(id: string, data: Partial<TherapistAvailabilityEntity>): Promise<TherapistAvailabilityEntity | null> {
    const updated = await AvailabilityModel.findByIdAndUpdate(id, data, { new: true });
    return updated ? this._toAvailabilityEntity(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await AvailabilityModel.findByIdAndDelete(id);
    return !!result;
  }

  async findById(id: string): Promise<TherapistAvailabilityEntity | null> {
    const found = await AvailabilityModel.findById(id);
    return found ? this._toAvailabilityEntity(found) : null;
  }

  async findByTherapistId(therapistId: string): Promise<TherapistAvailabilityEntity[]> {
    const list = await AvailabilityModel.find({ therapistId });
    return list.map(item => this._toAvailabilityEntity(item));
  }
}

export class SlotRepository implements ISlotRepository {
  private _toSlotEntity(doc: ISlotDocument): TherapistSlotEntity {
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

  async createMany(slots: TherapistSlotEntity[]): Promise<void> {
    await SlotModel.insertMany(slots, { ordered: false }).catch(err => {
      if (err.code !== 11000) throw err;
    });
  }

  async findById(id: string): Promise<TherapistSlotEntity | null> {
    const found = await SlotModel.findById(id);
    return found ? this._toSlotEntity(found) : null;
  }

  async updateStatus(id: string, status: SlotStatus): Promise<TherapistSlotEntity | null> {
    const updated = await SlotModel.findByIdAndUpdate(id, { status }, { new: true });
    return updated ? this._toSlotEntity(updated) : null;
  }

  async findAvailable(therapistId: string, startDate: Date, endDate: Date): Promise<TherapistSlotEntity[]> {
    const slots = await SlotModel.find({
      therapistId,
      status: "AVAILABLE",
      startTime: { $gte: startDate, $lte: endDate }
    }).sort({ startTime: 1 });
    return slots.map(s => this._toSlotEntity(s));
  }

  async findByTherapistIdAndDateRange(therapistId: string, startDate: Date, endDate: Date): Promise<TherapistSlotEntity[]> {
    const slots = await SlotModel.find({
      therapistId,
      startTime: { $lt: endDate },
      endTime: { $gt: startDate }
    }).sort({ startTime: 1 });
    return slots.map(s => this._toSlotEntity(s));
  }

  async deleteByAvailabilityId(availabilityId: string): Promise<void> {
    await SlotModel.deleteMany({ availabilityId, status: "AVAILABLE" });
  }
}
