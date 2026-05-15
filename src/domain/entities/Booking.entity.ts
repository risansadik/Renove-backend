export type BookingStatus = "pending" | "accepted" | "rejected" | "completed" | "cancelled";
export type SessionType = "video" | "chat" | "in-person";

export interface BookingEntity {
  id?: string;
  userId: string | { id: string; name: string; email: string };
  therapistId: string | { id: string; name: string };
  slotId: string | { id: string; startTime: Date; endTime: Date }; // References the new TherapistSlot
  type: SessionType;
  status: BookingStatus;
  note?: string;
  rejectionReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
