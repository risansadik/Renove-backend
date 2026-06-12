import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import { IReportRepository } from "../../../domain/repositories/IReportRepository.ts";
import { IGetReportDetailsUseCase } from "../../interfaces/report/IReportUseCase.ts";
import { ReportEntity } from "../../../domain/entities/Report.entity.ts";
import { AppError } from "../../../shared/utils/AppError.ts";
import { HttpStatus, MESSAGES } from "../../../shared/constants/index.ts";

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
