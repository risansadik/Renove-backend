import type { IBookingRaw } from "../databases/schema/booking.schema";
import type { BookingEntity } from "../../domain/entities/Booking.entity";

export class BookingDbMapper {
  static toEntity(doc: IBookingRaw): BookingEntity {
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
}
