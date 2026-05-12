import { z } from "zod";
import { THERAPIST_STATUS, USER_STATUS } from "../../../shared/constants/index.js";

export const AdminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const UpdateUserStatusSchema = z.object({
  status: z.enum([USER_STATUS.ACTIVE, USER_STATUS.BLOCKED]),
});

export const UpdateTherapistStatusSchema = z.object({
  status: z.enum([
    THERAPIST_STATUS.PENDING,
    THERAPIST_STATUS.APPROVED,
    THERAPIST_STATUS.REJECTED,
  ]),
});

export type AdminLoginDTO = z.infer<typeof AdminLoginSchema>;
export type UpdateUserStatusDTO = z.infer<typeof UpdateUserStatusSchema>;
export type UpdateTherapistStatusDTO = z.infer<typeof UpdateTherapistStatusSchema>;
