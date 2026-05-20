import type { BookingStatus } from "../../shared/constants/index.js";
export type { BookingStatus };
export type SessionType = "video" | "chat" | "in-person";

export interface BookingEntity {
  id?: string;
  userId: string | { id: string; name: string; email: string };
  therapistId: string | { id: string; name: string; consultationFee: number };
  slotId: string | { id: string; startTime: Date; endTime: Date }; // References the new TherapistSlot
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
