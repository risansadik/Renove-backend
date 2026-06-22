import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/constants/tokens";
import type { IReportRepository } from "../../../domain/repositories/report.repository";
import { IAdminGetAllReportsUseCase } from "../../interfaces/report/IReportUseCase";
import { ReportEntity } from "../../../domain/entities/Report.entity";
import { ReportStatus } from "../../../shared/constants/index";

@injectable()
export class AdminGetAllReportsUseCase implements IAdminGetAllReportsUseCase {
  constructor(
    @inject(TYPES.ReportRepository) private readonly _reportRepo: IReportRepository
  ) {}

  public async execute(page: number, limit: number, filter?: { status?: ReportStatus; category?: string }): Promise<{ data: ReportEntity[]; total: number }> {
    return this._reportRepo.findAll(page, limit, filter);
  }
}
