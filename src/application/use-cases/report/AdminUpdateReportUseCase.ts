import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import { IReportRepository } from "../../../domain/repositories/report.repository.ts";
import { IAdminUpdateReportUseCase } from "../../interfaces/report/IReportUseCase.ts";
import { ReportEntity } from "../../../domain/entities/Report.entity.ts";
import { AppError } from "../../../shared/utils/AppError.ts";
import { HttpStatus, MESSAGES, REPORT_STATUS, ReportStatus } from "../../../shared/constants/index.ts";
import type { INotificationService } from "../../interfaces/services/INotificationService.ts";
import type { NotificationRecipientRole } from "../../../domain/entities/Notification.entity.ts";

@injectable()
export class AdminUpdateReportUseCase implements IAdminUpdateReportUseCase {
  constructor(
    @inject(TYPES.ReportRepository) private readonly _reportRepo: IReportRepository,
    @inject(TYPES.NotificationService) private readonly _notificationService: INotificationService
  ) {}

  public async updateStatus(id: string, status: ReportStatus): Promise<ReportEntity> {
    const report = await this._reportRepo.updateStatus(id, status);
    if (!report) {
      throw new AppError(MESSAGES.REPORT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // Notify the reporter (user or therapist only — admins have no notification inbox)
    if (report.reporterRole !== "admin") {
      const recipientRole = report.reporterRole as NotificationRecipientRole;

      if (status === REPORT_STATUS.RESOLVED) {
        await this._notificationService.createAndEmit({
          recipientId: report.reporterId,
          recipientRole,
          type: "report_resolved",
          title: "Report Resolved",
          message: `Your report regarding "${report.subject}" has been reviewed and marked as resolved by our team.`,
        });
      } else if (status === REPORT_STATUS.REJECTED) {
        await this._notificationService.createAndEmit({
          recipientId: report.reporterId,
          recipientRole,
          type: "report_rejected",
          title: "Report Closed",
          message: `Your report regarding "${report.subject}" has been reviewed and closed. Please contact support if you need further assistance.`,
        });
      }
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
