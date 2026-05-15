import { z } from "zod";

export const CreateBookingSchema = z.object({
  therapistId: z.string().min(1, "Therapist ID is required"),
  slotId: z.string().min(1, "Slot ID is required"),
  type: z.enum(["video", "chat", "in-person"]).default("video"),
  note: z.string().max(500).optional(),
});

export const UpdateBookingStatusSchema = z.object({
  status: z.enum(["accepted", "rejected", "completed", "cancelled"]),
  rejectionReason: z.string().optional(),
});

export type CreateBookingDTO = z.infer<typeof CreateBookingSchema>;
export type UpdateBookingStatusDTO = z.infer<typeof UpdateBookingStatusSchema>;
