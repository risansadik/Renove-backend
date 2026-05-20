export interface TherapistAvailabilityEntity {
  id?: string;
  therapistId: string;
  title: string;
  timezone: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  recurrenceRule: string; // RRULE string
  recurrenceType: "weekly" | "once" | "daily";
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

import type { SlotStatus } from "../../shared/constants/index.js";
export type { SlotStatus };

export interface TherapistSlotEntity {
  id?: string;
  therapistId: string;
  availabilityId?: string; // Reference to the rule that generated this
  startTime: Date;
  endTime: Date;
  status: SlotStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
