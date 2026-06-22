import type { ReportCategory, ReportStatus, Role } from "../../shared/constants/index";

export interface ReportEntity {
  id: string;
  reporterId: string;
  reporterRole: Role;
  category: ReportCategory;
  subject: string;
  description: string;
  attachments: string[];
  status: ReportStatus;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}
