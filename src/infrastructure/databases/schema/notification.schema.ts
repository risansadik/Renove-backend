import mongoose, { Schema, type Document, type Types } from "mongoose";
import type { NotificationType, NotificationRecipientRole } from "../../../domain/entities/Notification.entity";

export interface INotificationDocument extends Document {
  recipientId: Types.ObjectId;
  recipientRole: NotificationRecipientRole;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  bookingId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    recipientId: { type: Schema.Types.ObjectId, required: true, index: true },
    recipientRole: { type: String, enum: ["user", "therapist"], required: true },
    type: {
      type: String,
      enum: [
        "booking_request",
        "booking_confirmed",
        "booking_rejected",
        "booking_cancelled",
        "booking_completed",
        "session_reminder",
        "therapist_approved",
         "therapist_rejected",
         "therapist_profile_approved",
         "therapist_profile_rejected",
         "account_suspended",
         "account_reactivated",
         "payment_confirmed",
         "payment_failed",
         "profile_update_submitted",
         "new_review_received",
         "report_resolved",
         "report_rejected"
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    bookingId: { type: Schema.Types.ObjectId },
  },
  { timestamps: true }
);

export const NotificationModel = mongoose.model<INotificationDocument>(
  "Notification",
  NotificationSchema
);