import type { BookingEntity, SessionType } from "../../domain/entities/Booking.entity";
import type { BookingStatus } from "../../shared/constants/index";

export interface PublicBookingDTO {
  id?: string;
  userId: string | { id: string; name: string; email: string };
  therapistId: string | { id: string; name: string; consultationFee: number };
  slotId: string | { id: string; startTime: Date; endTime: Date };
  type: SessionType;
  status: BookingStatus;
  note?: string;
  rejectionReason?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  cancelledAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class BookingMapper {
  static toPublicDTO(booking: BookingEntity): PublicBookingDTO {
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
      updatedAt: booking.updatedAt,
    };
  }

  static toPublicDTOList(bookings: BookingEntity[]): PublicBookingDTO[] {
    return bookings.map(b => this.toPublicDTO(b));
  }
}
