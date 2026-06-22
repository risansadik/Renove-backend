import { injectable, inject } from "inversify";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository";
import type { UpdateTherapistStatusDTO } from "../../dto/auth/admin.dto";
import type { IEmailService } from "../../interfaces/services/IEmailService";
import type { INotificationService } from "../../interfaces/services/INotificationService";
import { THERAPIST_STATUS } from "../../../shared/constants/index";
import { TYPES } from "../../../shared/constants/tokens";
import { NotFoundError } from "../../../shared/utils/AppError";

import type { IUpdateTherapistStatusUseCase } from "../../interfaces/admin/IAdminUseCase";

@injectable()
export class UpdateTherapistStatusUseCase implements IUpdateTherapistStatusUseCase {
  constructor(
    @inject(TYPES.TherapistRepository) private readonly _therapistRepo: ITherapistRepository,
    @inject(TYPES.EmailService) private readonly _emailService: IEmailService,
    @inject(TYPES.NotificationService) private readonly _notificationService: INotificationService
  ) {}

  async execute({ id, dto }: { id: string; dto: UpdateTherapistStatusDTO }): Promise<{ id: string; status: string }> {
    const therapist = await this._therapistRepo.findById(id);
    if (!therapist) throw new NotFoundError("Therapist");

    await this._therapistRepo.updateStatus(id, dto.status);

    if (dto.status === THERAPIST_STATUS.APPROVED) {
      await this._emailService.sendTherapistApprovalEmail(therapist.email, therapist.name);
      await this._notificationService.createAndEmit({
        recipientId: id,
        recipientRole: "therapist",
        type: "therapist_approved",
        title: "Account Approved",
        message: "Congratulations! Your therapist account has been approved. You can now accept bookings.",
      });
    } else if (dto.status === THERAPIST_STATUS.REJECTED) {
      await this._emailService.sendTherapistRejectionEmail(therapist.email, therapist.name);
      await this._notificationService.createAndEmit({
        recipientId: id,
        recipientRole: "therapist",
        type: "therapist_rejected",
        title: "Account Application Rejected",
        message: "Your therapist account application has been reviewed and rejected. Please contact support for more information.",
      });
    }

    return { id, status: dto.status };
  }
}
