import { Container } from "inversify";
import { TYPES } from "../../../shared/constants/tokens";

import { IReportRepository } from "../../../domain/repositories/report.repository";
import { ReportRepository } from "../../repositories/report-repository.impl";

import { ICreateReportUseCase, IGetMyReportsUseCase, IGetReportDetailsUseCase, IAdminGetAllReportsUseCase, IAdminUpdateReportUseCase } from "../../../application/interfaces/report/IReportUseCase";
import { CreateReportUseCase } from "../../../application/use-cases/report/CreateReportUseCase";
import { GetMyReportsUseCase } from "../../../application/use-cases/report/GetMyReportsUseCase";
import { GetReportDetailsUseCase } from "../../../application/use-cases/report/GetReportDetailsUseCase";
import { AdminGetAllReportsUseCase } from "../../../application/use-cases/report/AdminGetAllReportsUseCase";
import { AdminUpdateReportUseCase } from "../../../application/use-cases/report/AdminUpdateReportUseCase";

import { ReportController } from "../../../presentation/controllers/report.controller";

export const registerReportModule = (container: Container): void => {
  // Repositories
  container.bind<IReportRepository>(TYPES.ReportRepository).to(ReportRepository);

  // Use Cases
  container.bind<ICreateReportUseCase>(TYPES.CreateReportUseCase).to(CreateReportUseCase);
  container.bind<IGetMyReportsUseCase>(TYPES.GetMyReportsUseCase).to(GetMyReportsUseCase);
  container.bind<IGetReportDetailsUseCase>(TYPES.GetReportDetailsUseCase).to(GetReportDetailsUseCase);
  container.bind<IAdminGetAllReportsUseCase>(TYPES.AdminGetAllReportsUseCase).to(AdminGetAllReportsUseCase);
  container.bind<IAdminUpdateReportUseCase>(TYPES.AdminUpdateReportUseCase).to(AdminUpdateReportUseCase);

  // Controllers
  container.bind<ReportController>(TYPES.ReportController).to(ReportController);
};
