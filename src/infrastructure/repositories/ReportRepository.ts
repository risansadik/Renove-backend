import { injectable } from "inversify";
import { IReportRepository } from "../../../domain/repositories/IReportRepository.ts";
import { ReportEntity } from "../../../domain/entities/Report.entity.ts";
import { ReportModel, IReportDocument } from "../databases/schema/report.schema.ts";
import { ReportStatus } from "../../../shared/constants/index.ts";

@injectable()
export class ReportRepository implements IReportRepository {
  
  private mapToEntity(doc: IReportDocument): ReportEntity {
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

  public async create(report: Omit<ReportEntity, "id" | "createdAt" | "updatedAt">): Promise<ReportEntity> {
    const newReport = new ReportModel(report);
    const saved = await newReport.save();
    return this.mapToEntity(saved);
  }

  public async findById(id: string): Promise<ReportEntity | null> {
    const report = await ReportModel.findById(id).exec();
    if (!report) return null;
    return this.mapToEntity(report);
  }

  public async findByReporter(reporterId: string, page: number, limit: number): Promise<{ data: ReportEntity[]; total: number }> {
    const skip = (page - 1) * limit;
    
    const [reports, total] = await Promise.all([
      ReportModel.find({ reporterId }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      ReportModel.countDocuments({ reporterId }).exec()
    ]);

    return {
      data: reports.map(r => this.mapToEntity(r)),
      total
    };
  }

  public async findAll(page: number, limit: number, filter?: { status?: ReportStatus; category?: string }): Promise<{ data: ReportEntity[]; total: number }> {
    const skip = (page - 1) * limit;
    const query: any = {};
    if (filter?.status) query.status = filter.status;
    if (filter?.category) query.category = filter.category;

    const [reports, total] = await Promise.all([
      ReportModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      ReportModel.countDocuments(query).exec()
    ]);

    return {
      data: reports.map(r => this.mapToEntity(r)),
      total
    };
  }

  public async updateStatus(id: string, status: ReportStatus): Promise<ReportEntity | null> {
    const report = await ReportModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).exec();
    
    if (!report) return null;
    return this.mapToEntity(report);
  }

  public async addAdminNote(id: string, note: string): Promise<ReportEntity | null> {
    const report = await ReportModel.findByIdAndUpdate(
      id,
      { adminNotes: note },
      { new: true }
    ).exec();
    
    if (!report) return null;
    return this.mapToEntity(report);
  }
}
