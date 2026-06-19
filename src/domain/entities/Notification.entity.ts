export type NotificationType =
  | "booking_request"
  | "booking_confirmed"
  | "booking_rejected"
  | "booking_cancelled"
  | "booking_completed"
  | "session_reminder";

export type NotificationRecipientRole = "user" | "therapist";

export interface NotificationEntity {
  id: string;
  recipientId: string;
  recipientRole: NotificationRecipientRole;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  bookingId?: string;
  createdAt: Date;
  updatedAt: Date;
}