import { injectable } from "inversify";
import type { IBookingRepository } from "../../domain/repositories/booking.repository.ts";
import type { BookingEntity } from "../../domain/entities/Booking.entity.ts";
import type { BookingStatus } from "../../shared/constants/index.ts";
import { BookingModel, type IBookingRaw } from "../databases/schema/booking.schema.ts";
import { PaginationParams, PaginatedResult } from "../../domain/interfaces/pagination.ts";
import { BookingDbMapper } from "../mappers/booking.db-mapper.ts";

@injectable()
export class BookingRepositoryImpl implements IBookingRepository {
  async create(booking: Omit<BookingEntity, "id" | "createdAt" | "updatedAt">): Promise<BookingEntity> {
    const doc = await BookingModel.create(booking);
    return BookingDbMapper.toEntity(doc);
  }

  async findById(id: string): Promise<BookingEntity | null> {
    const doc = await BookingModel.findById(id)
      .populate("userId", "name email")
      .populate("therapistId", "name consultationFee")
      .populate("slotId");
    return doc ? BookingDbMapper.toEntity(doc) : null;
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
      data: docs.map(doc => BookingDbMapper.toEntity(doc as unknown as IBookingRaw)),
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
      data: docs.map(doc => BookingDbMapper.toEntity(doc as unknown as IBookingRaw)),
      total
    };
  }

  async updateStatus(id: string, status: BookingEntity["status"], rejectionReason?: string): Promise<BookingEntity | null> {
    const doc = await BookingModel.findByIdAndUpdate(
      id,
      { status, rejectionReason },
      { new: true }
    );
    return doc ? BookingDbMapper.toEntity(doc) : null;
  }

  async update(id: string, data: Partial<BookingEntity>): Promise<BookingEntity | null> {
    const doc = await BookingModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );
    return doc ? BookingDbMapper.toEntity(doc as unknown as IBookingRaw) : null;
  }

  async checkAvailability(therapistId: string, date: Date, slot: string): Promise<boolean> {
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

  async countByUserAndStatus(userId: string, status: BookingStatus): Promise<number> {
    return BookingModel.countDocuments({ userId, status }).exec();
  }

  async countByTherapistAndStatusBetween(therapistId: string, status: BookingStatus, start: Date, end: Date): Promise<number> {
    return BookingModel.countDocuments({
      therapistId,
      status,
      createdAt: { $gte: start, $lte: end },
    }).exec();
  }

  async hasUserCompletedSessionWithTherapist(userId: string, therapistId: string): Promise<boolean> {
    const completedBooking = await BookingModel.exists({
      userId,
      therapistId,
      status: "completed",
    }).exec();
    return Boolean(completedBooking);
  }

  async findAwaitingPaymentOlderThan(threshold: Date): Promise<BookingEntity[]> {
    const docs = await BookingModel.find({
      status: "awaiting_payment",
      updatedAt: { $lt: threshold },
    }).exec();
    return docs.map((doc) => BookingDbMapper.toEntity(doc as unknown as IBookingRaw));
  }

  async countAll(): Promise<number> {
    return BookingModel.countDocuments({}).exec();
  }

  async countBySlotStartTimeBetween(start: Date, end: Date): Promise<number> {
    return BookingModel.countDocuments({ "slotId.startTime": { $gte: start, $lte: end } }).exec();
  }

  async countByStatuses(statuses: BookingStatus[]): Promise<number> {
    return BookingModel.countDocuments({ status: { $in: statuses } }).exec();
  }

  async findRecentBookings(limit: number): Promise<BookingEntity[]> {
    const docs = await BookingModel.find({})
      .sort({ updatedAt: -1 })
      .limit(limit)
      .populate("userId", "name")
      .populate("therapistId", "name")
      .lean()
      .exec();
    return docs.map((doc) => BookingDbMapper.toEntity(doc as unknown as IBookingRaw));
  }

  async getTopTherapists(limit: number): Promise<Array<{ therapistId: string; name: string; completedSessions: number; averageRating: number; totalRatings: number }>> {
    return BookingModel.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: "$therapistId", completedSessions: { $sum: 1 } } },
      { $sort: { completedSessions: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "therapists",
          localField: "_id",
          foreignField: "_id",
          as: "therapist",
        },
      },
      { $unwind: "$therapist" },
      {
        $project: {
          therapistId: { $toString: "$_id" },
          name: "$therapist.name",
          completedSessions: 1,
          averageRating: { $ifNull: ["$therapist.averageRating", 0] },
          totalRatings: { $ifNull: ["$therapist.totalRatings", 0] },
        },
      },
    ]).exec();
  }

  async findBookingsCreatedAfter(date: Date): Promise<BookingEntity[]> {
    const docs = await BookingModel.find({ createdAt: { $gte: date } }).lean().exec();
    return docs.map(doc => BookingDbMapper.toEntity(doc as unknown as IBookingRaw));
  }

  async getStatusDistribution(): Promise<Array<{ status: string; count: number }>> {
    const result = await BookingModel.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]).exec();
    return result.map(item => ({ status: item._id, count: item.count }));
  }
}
