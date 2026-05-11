import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain uppercase letter")
  .regex(/[0-9]/, "Must contain number");

export const RegisterTherapistSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: passwordSchema,
  phone: z.string().min(10).max(15),
  gender: z.enum(["male", "female", "other"]),
  qualification: z.string().min(2),
  specialization: z.array(z.string()).min(1, "At least one specialization required"),
  experience: z.number().min(0).max(60),
  consultationFee: z.number().min(0),
  bio: z.string().min(50, "Bio must be at least 50 characters").max(1000),
  certifications: z.array(z.string()).optional(),
});

export const LoginTherapistSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const VerifyTherapistOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const ResendTherapistOtpSchema = z.object({
  email: z.string().email(),
});

export type RegisterTherapistDTO = z.infer<typeof RegisterTherapistSchema>;
export type LoginTherapistDTO = z.infer<typeof LoginTherapistSchema>;
export type VerifyTherapistOtpDTO = z.infer<typeof VerifyTherapistOtpSchema>;
export type ResendTherapistOtpDTO = z.infer<typeof ResendTherapistOtpSchema>;