import type { ReportEntity } from "../../domain/entities/Report.entity";
import type { ReportCategory, ReportStatus, Role } from "../../shared/constants/index";

export interface PublicReportDTO {
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

export class ReportMapper {
  static toPublicDTO(entity: ReportEntity): PublicReportDTO {
    return {
      id: entity.id,
      reporterId: entity.reporterId,
      reporterRole: entity.reporterRole,
      category: entity.category,
      subject: entity.subject,
      description: entity.description,
      attachments: entity.attachments,
      status: entity.status,
      adminNotes: entity.adminNotes,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toPublicDTOList(entities: ReportEntity[]): PublicReportDTO[] {
    return entities.map(e => this.toPublicDTO(e));
  }
}
