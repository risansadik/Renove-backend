import type { BookingEntity } from "../../domain/entities/Booking.entity.js";
import type { IBookingRaw } from "../../infrastructure/databases/schema/booking.schema.js";

export class BookingMapper {
  static toEntity(doc: IBookingRaw): BookingEntity {
    return {
      id: doc._id.toString(),
      userId: typeof doc.userId === 'object' && doc.userId && '_id' in doc.userId
        ? (doc.userId as { _id: { toString: () => string } })._id.toString() 
        : (doc.userId as { toString: () => string }).toString(),
      therapistId: typeof doc.therapistId === 'object' && doc.therapistId && '_id' in doc.therapistId
        ? (doc.therapistId as { _id: { toString: () => string } })._id.toString() 
        : (doc.therapistId as { toString: () => string }).toString(),
      slotId: typeof doc.slotId === 'object' && doc.slotId && '_id' in doc.slotId
        ? (doc.slotId as { _id: { toString: () => string } })._id.toString() 
        : (doc.slotId as { toString: () => string }).toString(),
      type: doc.type,
      status: doc.status,
      note: doc.note,
      rejectionReason: doc.rejectionReason,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  static toPublicDTO(booking: BookingEntity) {
    return {
      id: booking.id,
      userId: booking.userId,
      therapistId: booking.therapistId,
      slotId: booking.slotId,
      type: booking.type,
      status: booking.status,
      note: booking.note,
      rejectionReason: booking.rejectionReason,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    };
  }

  static toPublicDTOList(bookings: BookingEntity[]) {
    return bookings.map(b => this.toPublicDTO(b));
  }
}
