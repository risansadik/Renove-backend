import { Container } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";

import { IReportRepository } from "../../../domain/repositories/IReportRepository.ts";
import { ReportRepository } from "../../repositories/ReportRepository.ts";

import { ICreateReportUseCase, IGetMyReportsUseCase, IGetReportDetailsUseCase, IAdminGetAllReportsUseCase, IAdminUpdateReportUseCase } from "../../../application/interfaces/report/IReportUseCase.ts";
import { CreateReportUseCase } from "../../../application/use-cases/report/CreateReportUseCase.ts";
import { GetMyReportsUseCase } from "../../../application/use-cases/report/GetMyReportsUseCase.ts";
import { GetReportDetailsUseCase } from "../../../application/use-cases/report/GetReportDetailsUseCase.ts";
import { AdminGetAllReportsUseCase } from "../../../application/use-cases/report/AdminGetAllReportsUseCase.ts";
import { AdminUpdateReportUseCase } from "../../../application/use-cases/report/AdminUpdateReportUseCase.ts";

import { ReportController } from "../../../presentation/controllers/report.controller.ts";

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
