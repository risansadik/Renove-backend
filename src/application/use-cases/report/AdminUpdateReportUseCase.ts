import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import { IReportRepository } from "../../../domain/repositories/report.repository.ts";
import { IAdminUpdateReportUseCase } from "../../interfaces/report/IReportUseCase.ts";
import { ReportEntity } from "../../../domain/entities/Report.entity.ts";
import { AppError } from "../../../shared/utils/AppError.ts";
import { HttpStatus, MESSAGES, ReportStatus } from "../../../shared/constants/index.ts";

@injectable()
export class AdminUpdateReportUseCase implements IAdminUpdateReportUseCase {
  constructor(
    @inject(TYPES.ReportRepository) private readonly _reportRepo: IReportRepository
  ) {}

  public async updateStatus(id: string, status: ReportStatus): Promise<ReportEntity> {
    const report = await this._reportRepo.updateStatus(id, status);
    if (!report) {
      throw new AppError(MESSAGES.REPORT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return report;
  }

  public async addNotes(id: string, notes: string): Promise<ReportEntity> {
    const report = await this._reportRepo.addAdminNote(id, notes);
    if (!report) {
      throw new AppError(MESSAGES.REPORT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return report;
  }
}
