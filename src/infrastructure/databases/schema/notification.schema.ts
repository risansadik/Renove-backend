import mongoose, { Schema, type Document, type Types } from "mongoose";
import type { NotificationType, NotificationRecipientRole } from "../../../domain/entities/Notification.entity.ts";

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