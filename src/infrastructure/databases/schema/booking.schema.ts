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
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"], 
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
