import { z } from "zod";
import { THERAPIST_STATUS } from "../../../shared/constants/index.ts";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      passwordRegex,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

export const UpdateUserProfileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").optional(),
});

export const UpdateAdminProfileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").optional(),
});

export const UpdateTherapistProfileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").optional(),
  qualification: z.string().optional(),
  specialization: z.union([z.string(), z.array(z.string())]).optional(),
  experience: z.union([z.string(), z.number()]).optional(),
  consultationFee: z.union([z.string(), z.number()]).optional(),
  bio: z.string().min(10, "Bio must be at least 10 characters").optional(),
  certifications: z.union([z.string(), z.array(z.string())]).optional(),
});

export const ReviewTherapistUpdateSchema = z.object({
  status: z.enum([THERAPIST_STATUS.APPROVED, THERAPIST_STATUS.REJECTED]),
  reason: z.string().optional(),
}).refine((data) => {
  if (data.status === THERAPIST_STATUS.REJECTED && !data.reason) {
    return false;
  }
  return true;
}, {
  message: "Rejection reason is required when rejecting profile updates",
  path: ["reason"],
});
