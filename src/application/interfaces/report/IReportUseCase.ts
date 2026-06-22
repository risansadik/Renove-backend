import { ReportEntity } from "../../../domain/entities/Report.entity";
import { CreateReportDTO } from "../../dto/report/report.dto";
import { ReportStatus, Role } from "../../../shared/constants/index";

export interface ICreateReportUseCase {
  execute(data: CreateReportDTO & { reporterId: string; reporterRole: Role; attachments: string[] }): Promise<ReportEntity>;
}

export interface IGetMyReportsUseCase {
  execute(reporterId: string, page: number, limit: number): Promise<{ data: ReportEntity[]; total: number }>;
}

export interface IGetReportDetailsUseCase {
  execute(id: string): Promise<ReportEntity>;
}

export interface IAdminGetAllReportsUseCase {
  execute(page: number, limit: number, filter?: { status?: ReportStatus; category?: string }): Promise<{ data: ReportEntity[]; total: number }>;
}

export interface IAdminUpdateReportUseCase {
  updateStatus(id: string, status: ReportStatus): Promise<ReportEntity>;
  addNotes(id: string, notes: string): Promise<ReportEntity>;
}
