export type BookingStatus = "pending" | "accepted" | "rejected" | "completed" | "cancelled";
export type SessionType = "video" | "chat" | "in-person";

export interface BookingEntity {
  id?: string;
  userId: string;
  therapistId: string;
  slotId: string; // References the new TherapistSlot
  type: SessionType;
  status: BookingStatus;
  note?: string;
  rejectionReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
