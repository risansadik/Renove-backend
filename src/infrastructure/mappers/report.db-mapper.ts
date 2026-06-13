import type { IReportDocument } from "../databases/schema/report.schema.ts";
import type { ReportEntity } from "../../domain/entities/Report.entity.ts";

export class ReportDbMapper {
  static toEntity(doc: IReportDocument): ReportEntity {
    return {
      id: doc._id.toString(),
      reporterId: doc.reporterId,
      reporterRole: doc.reporterRole,
      category: doc.category,
      subject: doc.subject,
      description: doc.description,
      attachments: doc.attachments,
      status: doc.status,
      adminNotes: doc.adminNotes,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
