import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/constants/tokens";
import type { IReportRepository } from "../../../domain/repositories/report.repository";
import { IGetReportDetailsUseCase } from "../../interfaces/report/IReportUseCase";
import { ReportEntity } from "../../../domain/entities/Report.entity";
import { AppError } from "../../../shared/utils/AppError";
import { HttpStatus, MESSAGES } from "../../../shared/constants/index";

@injectable()
export class GetReportDetailsUseCase implements IGetReportDetailsUseCase {
  constructor(
    @inject(TYPES.ReportRepository) private readonly _reportRepo: IReportRepository
  ) {}

  public async execute(id: string): Promise<ReportEntity> {
    const report = await this._reportRepo.findById(id);
    if (!report) {
      throw new AppError(MESSAGES.REPORT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return report;
  }
}
