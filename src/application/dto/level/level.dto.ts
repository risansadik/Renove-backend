import { z } from "zod";
import { ADDICTION_SEVERITY } from "../../../shared/constants/index";

export const GenerateLevelsSchema = z.object({
  addictionType: z
    .string({ required_error: "Addiction type is required" })
    .min(2, "Addiction type must be at least 2 characters")
    .max(100, "Addiction type too long"),
  severity: z.enum(
    [ADDICTION_SEVERITY.MILD, ADDICTION_SEVERITY.MODERATE, ADDICTION_SEVERITY.SEVERE],
    { required_error: "Severity is required" }
  ),
  interests: z
    .array(z.string().min(1).max(50))
    .min(1, "At least one interest is required")
    .max(10, "Maximum 10 interests allowed"),
  startLevel: z.number().int().min(1).default(1),
  endLevel: z.number().int().min(1).default(5),
  regenerate: z.boolean().optional().default(false),
}).refine((data) => data.endLevel >= data.startLevel, {
  message: "endLevel must be greater than or equal to startLevel",
  path: ["endLevel"],
});

export type GenerateLevelsDTO = z.infer<typeof GenerateLevelsSchema>;