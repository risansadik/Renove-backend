export interface TherapistChatThreadEntity {
  id?: string;
  userId: string | { id: string; name: string; email: string };
  therapistId: string | { id: string; name: string };
  expiresAt: Date;
  lastBookingId: string;
  createdAt?: Date;
  updatedAt?: Date;
}