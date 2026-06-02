import type { BookingEntity } from "../../domain/entities/Booking.entity.ts";

export class BookingMapper {
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
      cancelledBy: booking.cancelledBy,
      cancellationReason: booking.cancellationReason,
      cancelledAt: booking.cancelledAt,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    };
  }

  static toPublicDTOList(bookings: BookingEntity[]) {
    return bookings.map(b => this.toPublicDTO(b));
  }
}
