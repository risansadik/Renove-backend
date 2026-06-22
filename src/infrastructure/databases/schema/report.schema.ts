import mongoose, { Schema, Document } from "mongoose";
import { ReportEntity } from "../../../domain/entities/Report.entity";
import { REPORT_STATUS, REPORT_CATEGORY, ROLES } from "../../../shared/constants/index";

export interface IReportDocument extends Omit<ReportEntity, "id">, Document {}

const reportSchema = new Schema<IReportDocument>(
  {
    reporterId: { type: String, required: true },
    reporterRole: { 
      type: String, 
      enum: Object.values(ROLES), 
      required: true 
    },
    category: { 
      type: String, 
      enum: Object.values(REPORT_CATEGORY), 
      required: true 
    },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    attachments: [{ type: String }],
    status: { 
      type: String, 
      enum: Object.values(REPORT_STATUS), 
      default: REPORT_STATUS.OPEN 
    },
    adminNotes: { type: String },
  },
  {
    timestamps: true,
  }
);

export const ReportModel = mongoose.model<IReportDocument>("Report", reportSchema);
