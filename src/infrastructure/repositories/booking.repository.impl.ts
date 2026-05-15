import type { IBookingRepository } from "../../domain/repositories/booking.repository.js";
import type { BookingEntity } from "../../domain/entities/Booking.entity.js";
import { BookingModel, type IBookingRaw } from "../databases/schema/booking.schema.js";

export class BookingRepositoryImpl implements IBookingRepository {
  private toEntity(doc: IBookingRaw): BookingEntity {
    return {
      id: doc._id.toString(),
      userId: typeof doc.userId === 'object' && doc.userId && "name" in doc.userId
        ? { id: doc.userId._id.toString(), name: (doc.userId as { name: string }).name, email: (doc.userId as { email: string }).email }
        : (doc.userId as { toString: () => string }).toString(),
      therapistId: typeof doc.therapistId === 'object' && doc.therapistId && "name" in doc.therapistId
        ? { id: doc.therapistId._id.toString(), name: (doc.therapistId as { name: string }).name }
        : (doc.therapistId as { toString: () => string }).toString(),
      slotId: typeof doc.slotId === 'object' && doc.slotId && "startTime" in doc.slotId
        ? { id: doc.slotId._id.toString(), startTime: (doc.slotId as { startTime: Date }).startTime, endTime: (doc.slotId as { endTime: Date }).endTime }
        : (doc.slotId ? (doc.slotId as { toString: () => string }).toString() : ""),
      type: doc.type,
      status: doc.status,
      note: doc.note,
      rejectionReason: doc.rejectionReason,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async create(booking: Omit<BookingEntity, "id" | "createdAt" | "updatedAt">): Promise<BookingEntity> {
    const doc = await BookingModel.create(booking);
    return this.toEntity(doc);
  }

  async findById(id: string): Promise<BookingEntity | null> {
    const doc = await BookingModel.findById(id)
      .populate("userId", "name email")
      .populate("therapistId", "name")
      .populate("slotId");
    return doc ? this.toEntity(doc) : null;
  }

  async findByUserId(userId: string): Promise<BookingEntity[]> {
    const docs = await BookingModel.find({ userId })
      .populate("therapistId", "name")
      .populate("slotId")
      .sort({ createdAt: -1 });
    return docs.map(doc => this.toEntity(doc));
  }

  async findByTherapistId(therapistId: string): Promise<BookingEntity[]> {
    const docs = await BookingModel.find({ therapistId })
      .populate("userId", "name email")
      .populate("slotId")
      .sort({ createdAt: -1 });
    return docs.map(doc => this.toEntity(doc));
  }

  async updateStatus(id: string, status: BookingEntity["status"], rejectionReason?: string): Promise<BookingEntity | null> {
    const doc = await BookingModel.findByIdAndUpdate(
      id,
      { status, rejectionReason },
      { new: true }
    );
    return doc ? this.toEntity(doc) : null;
  }

  async checkAvailability(therapistId: string, date: Date, slot: string): Promise<boolean> {
    // Check for any non-rejected, non-cancelled bookings
    const existing = await BookingModel.findOne({
      therapistId,
      date: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      },
      slot,
      status: { $nin: ["rejected", "cancelled"] }
    });
    return !existing;
  }
}
