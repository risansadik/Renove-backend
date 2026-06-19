export type NotificationType =
  | "booking_request"
  | "booking_confirmed"
  | "booking_rejected"
  | "booking_cancelled"
  | "booking_completed"
  | "session_reminder"
  | "therapist_approved"
  | "therapist_rejected"
  | "therapist_profile_approved"
  | "therapist_profile_rejected"
  | "account_suspended"
  | "account_reactivated"
  | "payment_confirmed"
  | "payment_failed"
  | "profile_update_submitted"
  | "new_review_received"
  | "report_resolved"
  | "report_rejected";

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