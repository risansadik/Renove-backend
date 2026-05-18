import mongoose, { Schema, type Document, type Types } from "mongoose";
import type { BookingStatus, SessionType } from "../../../domain/entities/Booking.entity.js";

export interface IBookingDocument extends Document {
  userId: Types.ObjectId;
  therapistId: Types.ObjectId;
  slotId: Types.ObjectId;
  type: SessionType;
  status: BookingStatus;
  note?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type IBookingRaw = Omit<IBookingDocument, keyof mongoose.Document | "userId" | "therapistId" | "slotId"> & { 
  _id: Types.ObjectId;
  userId: Types.ObjectId | { _id: Types.ObjectId; name: string; email: string };
  therapistId: Types.ObjectId | { _id: Types.ObjectId; name: string; consultationFee: number };
  slotId: Types.ObjectId | { _id: Types.ObjectId; startTime: Date; endTime: Date };
};

const BookingSchema = new Schema<IBookingDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    therapistId: { type: Schema.Types.ObjectId, ref: "Therapist", required: true },
    slotId: { type: Schema.Types.ObjectId, ref: "Slot", required: true },
    type: { 
      type: String, 
      enum: ["video", "chat", "in-person"], 
      default: "video" 
    },
    status: { 
      type: String, 
      enum: ["pending", "rejected", "awaiting_payment", "confirmed", "completed", "cancelled", "expired"], 
      default: "pending" 
    },
    note: { type: String },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

// Prevent double booking of same slot
BookingSchema.index({ slotId: 1 }, { unique: true });

// Facilitate queries
BookingSchema.index({ userId: 1 });
BookingSchema.index({ therapistId: 1 });

export const BookingModel = mongoose.model<IBookingDocument>("Booking", BookingSchema);
