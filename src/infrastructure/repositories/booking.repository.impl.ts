import type { IBookingRepository } from "../../domain/repositories/booking.repository.js";
import type { BookingEntity } from "../../domain/entities/Booking.entity.js";
import { BookingModel, type IBookingRaw } from "../databases/schema/booking.schema.js";

import { PaginationParams, PaginatedResult } from "../../domain/interfaces/pagination.js";

export class BookingRepositoryImpl implements IBookingRepository {
  private _toEntity(doc: IBookingRaw): BookingEntity {
    return {
      id: doc._id.toString(),
      userId: typeof doc.userId === 'object' && doc.userId && "name" in doc.userId
        ? { id: doc.userId._id.toString(), name: (doc.userId as { name: string }).name, email: (doc.userId as { email: string }).email }
        : (doc.userId as { toString: () => string }).toString(),
      therapistId: typeof doc.therapistId === 'object' && doc.therapistId && "name" in doc.therapistId
        ? {
          id: doc.therapistId._id.toString(),
          name: (doc.therapistId as { name: string }).name,
          consultationFee: (doc.therapistId as { consultationFee?: number }).consultationFee ?? 0
        }
        : (doc.therapistId as { toString: () => string }).toString(),
      slotId: typeof doc.slotId === 'object' && doc.slotId && "startTime" in doc.slotId
        ? { id: doc.slotId._id.toString(), startTime: (doc.slotId as { startTime: Date }).startTime, endTime: (doc.slotId as { endTime: Date }).endTime }
        : (doc.slotId ? (doc.slotId as { toString: () => string }).toString() : ""),
      type: doc.type,
      status: doc.status,
      note: doc.note,
      rejectionReason: doc.rejectionReason,
      cancelledBy: doc.cancelledBy?.toString(),
      cancellationReason: doc.cancellationReason,
      cancelledAt: doc.cancelledAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async create(booking: Omit<BookingEntity, "id" | "createdAt" | "updatedAt">): Promise<BookingEntity> {
    const doc = await BookingModel.create(booking);
    return this._toEntity(doc);
  }

  async findById(id: string): Promise<BookingEntity | null> {
    const doc = await BookingModel.findById(id)
      .populate("userId", "name email")
      .populate("therapistId", "name consultationFee")
      .populate("slotId");
    return doc ? this._toEntity(doc) : null;
  }

  async findByUserId(userId: string, params?: PaginationParams): Promise<PaginatedResult<BookingEntity>> {
    const query = BookingModel.find({ userId })
      .populate("therapistId", "name consultationFee")
      .populate("slotId")
      .sort({ createdAt: -1 });
    
    if (params) {
      query.skip((params.page - 1) * params.limit).limit(params.limit);
    }

    const [docs, total] = await Promise.all([
      query.lean().exec(),
      BookingModel.countDocuments({ userId })
    ]);

    return {
      data: docs.map(doc => this._toEntity(doc as unknown as IBookingRaw)),
      total
    };
  }

  async findByTherapistId(therapistId: string, params?: PaginationParams): Promise<PaginatedResult<BookingEntity>> {
    const query = BookingModel.find({ therapistId })
      .populate("userId", "name email")
      .populate("slotId")
      .sort({ createdAt: -1 });

    if (params) {
      query.skip((params.page - 1) * params.limit).limit(params.limit);
    }

    const [docs, total] = await Promise.all([
      query.lean().exec(),
      BookingModel.countDocuments({ therapistId })
    ]);

    return {
      data: docs.map(doc => this._toEntity(doc as unknown as IBookingRaw)),
      total
    };
  }

  async updateStatus(id: string, status: BookingEntity["status"], rejectionReason?: string): Promise<BookingEntity | null> {
    const doc = await BookingModel.findByIdAndUpdate(
      id,
      { status, rejectionReason },
      { new: true }
    );
    return doc ? this._toEntity(doc) : null;
  }

  async update(id: string, data: Partial<BookingEntity>): Promise<BookingEntity | null> {
    const doc = await BookingModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );
    return doc ? this._toEntity(doc as unknown as IBookingRaw) : null;
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
