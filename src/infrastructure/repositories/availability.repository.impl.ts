import { injectable } from "inversify";
import { AvailabilityModel, SlotModel } from "../databases/schema/availability.schema";
import type { IAvailabilityRepository, ISlotRepository } from "../../domain/repositories/availability.repository";
import type { TherapistAvailabilityEntity, TherapistSlotEntity, SlotStatus } from "../../domain/entities/TherapistAvailability.entity";
import { AvailabilityDbMapper } from "../mappers/availability.db-mapper";

@injectable()
export class AvailabilityRepository implements IAvailabilityRepository {
  async create(data: TherapistAvailabilityEntity): Promise<TherapistAvailabilityEntity> {
    const created = await AvailabilityModel.create(data);
    return AvailabilityDbMapper.toAvailabilityEntity(created);
  }

  async update(id: string, data: Partial<TherapistAvailabilityEntity>): Promise<TherapistAvailabilityEntity | null> {
    const updated = await AvailabilityModel.findByIdAndUpdate(id, data, { new: true });
    return updated ? AvailabilityDbMapper.toAvailabilityEntity(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await AvailabilityModel.findByIdAndDelete(id);
    return !!result;
  }

  async findById(id: string): Promise<TherapistAvailabilityEntity | null> {
    const found = await AvailabilityModel.findById(id);
    return found ? AvailabilityDbMapper.toAvailabilityEntity(found) : null;
  }

  async findByTherapistId(therapistId: string): Promise<TherapistAvailabilityEntity[]> {
    const list = await AvailabilityModel.find({ therapistId });
    return list.map(item => AvailabilityDbMapper.toAvailabilityEntity(item));
  }
}

@injectable()
export class SlotRepository implements ISlotRepository {
  async createMany(slots: TherapistSlotEntity[]): Promise<void> {
    await SlotModel.insertMany(slots, { ordered: false }).catch(err => {
      if (err.code !== 11000) throw err;
    });
  }

  async findById(id: string): Promise<TherapistSlotEntity | null> {
    const found = await SlotModel.findById(id);
    return found ? AvailabilityDbMapper.toSlotEntity(found) : null;
  }

  async updateStatus(id: string, status: SlotStatus): Promise<TherapistSlotEntity | null> {
    const updated = await SlotModel.findByIdAndUpdate(id, { status }, { new: true });
    return updated ? AvailabilityDbMapper.toSlotEntity(updated) : null;
  }

  async findAvailable(therapistId: string, startDate: Date, endDate: Date): Promise<TherapistSlotEntity[]> {
    const now = new Date();
    const slots = await SlotModel.find({
      therapistId,
      status: "AVAILABLE",
      startTime: { $gte: startDate, $lte: endDate },
      $or: [
        { lockedBy: null },
        { lockExpiresAt: { $lte: now } }
      ]
    }).sort({ startTime: 1 });
    return slots.map(s => AvailabilityDbMapper.toSlotEntity(s));
  }
  
  async findByTherapistIdAndDateRange(therapistId: string, startDate: Date, endDate: Date): Promise<TherapistSlotEntity[]> {
    const slots = await SlotModel.find({
      therapistId,
      startTime: { $lt: endDate },
      endTime: { $gt: startDate }
    }).sort({ startTime: 1 });
    return slots.map(s => AvailabilityDbMapper.toSlotEntity(s));
  }

  async deleteByAvailabilityId(availabilityId: string): Promise<void> {
    await SlotModel.deleteMany({ availabilityId, status: "AVAILABLE" });
  }

  async lockSlot(slotId: string, userId: string, expiresAt: Date): Promise<boolean> {
    const now = new Date();
    const result = await SlotModel.findOneAndUpdate(
      {
        _id: slotId,
        status: "AVAILABLE",
        $or: [
          { lockExpiresAt: null },
          { lockExpiresAt: { $lte: now } }
        ]
      },
      {
        $set: {
          lockedBy: userId,
          lockExpiresAt: expiresAt
        }
      },
      { new: true }
    );
    return !!result;
  }

  async unlockSlot(slotId: string, userId: string): Promise<void> {
    await SlotModel.findOneAndUpdate(
      { _id: slotId, lockedBy: userId },
      { $set: { lockedBy: null, lockExpiresAt: null } }
    );
  }

  async releaseExpiredLocks(): Promise<void> {
    await SlotModel.updateMany(
      {
        status: "AVAILABLE",
        lockExpiresAt: { $lte: new Date() }
      },
      {
        $set: { lockedBy: null, lockExpiresAt: null }
      }
    );
  }
}
