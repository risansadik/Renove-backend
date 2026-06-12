import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import { IReportRepository } from "../../../domain/repositories/IReportRepository.ts";
import { IAdminGetAllReportsUseCase } from "../../interfaces/report/IReportUseCase.ts";
import { ReportEntity } from "../../../domain/entities/Report.entity.ts";
import { ReportStatus } from "../../../shared/constants/index.ts";

@injectable()
export class AdminGetAllReportsUseCase implements IAdminGetAllReportsUseCase {
  constructor(
    @inject(TYPES.ReportRepository) private readonly _reportRepo: IReportRepository
  ) {}

  public async execute(page: number, limit: number, filter?: { status?: ReportStatus; category?: string }): Promise<{ data: ReportEntity[]; total: number }> {
    return this._reportRepo.findAll(page, limit, filter);
  }
}
