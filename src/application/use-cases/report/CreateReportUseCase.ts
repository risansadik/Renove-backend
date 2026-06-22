import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/constants/tokens";
import type { IReportRepository } from "../../../domain/repositories/report.repository";
import { ICreateReportUseCase } from "../../interfaces/report/IReportUseCase";
import { ReportEntity } from "../../../domain/entities/Report.entity";
import { CreateReportDTO } from "../../dto/report/report.dto";
import { REPORT_STATUS, Role } from "../../../shared/constants/index";

@injectable()
export class CreateReportUseCase implements ICreateReportUseCase {
  constructor(
    @inject(TYPES.ReportRepository) private readonly _reportRepo: IReportRepository
  ) {}

  public async execute(data: CreateReportDTO & { reporterId: string; reporterRole: Role; attachments: string[] }): Promise<ReportEntity> {
    return this._reportRepo.create({
      reporterId: data.reporterId,
      reporterRole: data.reporterRole,
      category: data.category,
      subject: data.subject,
      description: data.description,
      attachments: data.attachments,
      status: REPORT_STATUS.OPEN,
    });
  }
}
