import mongoose, { Schema, type Document, type Types } from "mongoose";
import type { SlotStatus } from "../../../domain/entities/TherapistAvailability.entity.ts";

export interface IAvailabilityDocument extends Document {
  therapistId: Types.ObjectId;
  title: string;
  timezone: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  recurrenceRule: string;
  recurrenceType: "weekly" | "once" | "daily";
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AvailabilitySchema = new Schema<IAvailabilityDocument>(
  {
    therapistId: { type: Schema.Types.ObjectId, ref: "Therapist", required: true },
    title: { type: String, required: true },
    timezone: { type: String, default: "UTC" },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    recurrenceRule: { type: String, required: true },
    recurrenceType: { type: String, enum: ["weekly", "once", "daily"], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export interface ISlotDocument extends Document {
  therapistId: Types.ObjectId;
  availabilityId: Types.ObjectId;
  startTime: Date;
  endTime: Date;
  status: SlotStatus;
  lockedBy?: mongoose.Types.ObjectId | null;
  lockExpiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const SlotSchema = new Schema<ISlotDocument>(
  {
    therapistId: { type: Schema.Types.ObjectId, ref: "Therapist", required: true },
    availabilityId: { type: Schema.Types.ObjectId, ref: "Availability", required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["AVAILABLE", "RESERVED", "BOOKED", "BLOCKED", "EXPIRED"],
      default: "AVAILABLE"
    },
    lockedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    lockExpiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Indexes
SlotSchema.index({ therapistId: 1, startTime: 1 }, { unique: true });
SlotSchema.index({ status: 1 });

export const AvailabilityModel = mongoose.model<IAvailabilityDocument>("Availability", AvailabilitySchema);
export const SlotModel = mongoose.model<ISlotDocument>("Slot", SlotSchema);
