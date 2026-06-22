import { z } from "zod";
import { REPORT_CATEGORY, REPORT_STATUS } from "../../../shared/constants/index";

export const CreateReportSchema = z.object({
  category: z.nativeEnum(REPORT_CATEGORY, {
    errorMap: () => ({ message: "Invalid report category" })
  }),
  subject: z.string().min(5, "Subject must be at least 5 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
  // attachments will be handled by multer and added to the request body / file
});

export const UpdateReportStatusSchema = z.object({
  status: z.nativeEnum(REPORT_STATUS, {
    errorMap: () => ({ message: "Invalid report status" })
  }),
});

export const AddReportNoteSchema = z.object({
  adminNotes: z.string().min(2, "Notes must be at least 2 characters"),
});

export const ReportQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  status: z.nativeEnum(REPORT_STATUS).optional(),
  category: z.nativeEnum(REPORT_CATEGORY).optional(),
});

export type CreateReportDTO = z.infer<typeof CreateReportSchema>;
export type UpdateReportStatusDTO = z.infer<typeof UpdateReportStatusSchema>;
export type AddReportNoteDTO = z.infer<typeof AddReportNoteSchema>;
export type ReportQueryDTO = z.infer<typeof ReportQuerySchema>;
