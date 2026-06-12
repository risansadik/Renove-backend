import { ReportEntity } from "../entities/Report.entity.ts";
import { ReportStatus } from "../../shared/constants/index.ts";

export interface IReportRepository {
  create(report: Omit<ReportEntity, "id" | "createdAt" | "updatedAt">): Promise<ReportEntity>;
  findById(id: string): Promise<ReportEntity | null>;
  findByReporter(reporterId: string, page: number, limit: number): Promise<{ data: ReportEntity[]; total: number }>;
  findAll(page: number, limit: number, filter?: { status?: ReportStatus; category?: string }): Promise<{ data: ReportEntity[]; total: number }>;
  updateStatus(id: string, status: ReportStatus): Promise<ReportEntity | null>;
  addAdminNote(id: string, note: string): Promise<ReportEntity | null>;
  countByStatuses(statuses: ReportStatus[]): Promise<number>;
  findRecent(limit: number): Promise<ReportEntity[]>;
}
