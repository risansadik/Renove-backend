import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import { IReportRepository } from "../../../domain/repositories/report.repository.ts";
import { IGetMyReportsUseCase } from "../../interfaces/report/IReportUseCase.ts";
import { ReportEntity } from "../../../domain/entities/Report.entity.ts";

@injectable()
export class GetMyReportsUseCase implements IGetMyReportsUseCase {
  constructor(
    @inject(TYPES.ReportRepository) private readonly _reportRepo: IReportRepository
  ) {}

  public async execute(reporterId: string, page: number, limit: number): Promise<{ data: ReportEntity[]; total: number }> {
    return this._reportRepo.findByReporter(reporterId, page, limit);
  }
}
