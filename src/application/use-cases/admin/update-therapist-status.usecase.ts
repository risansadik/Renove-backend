import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.js";
import type { UpdateTherapistStatusDTO } from "../../dto/auth/admin.dto.js";
import {
  sendTherapistApprovalEmail,
  sendTherapistRejectionEmail,
} from "../../../infrastructure/external-services/email.service.js";
import { THERAPIST_STATUS } from "../../../shared/constants/index.js";
import { NotFoundError } from "../../../shared/utils/AppError.js";

import type { IUpdateTherapistStatusUseCase } from "../../interfaces/admin/IAdminUseCase.js";

export class UpdateTherapistStatusUseCase implements IUpdateTherapistStatusUseCase {
  constructor(private readonly therapistRepo: ITherapistRepository) {}

  async execute({ id, dto }: { id: string; dto: UpdateTherapistStatusDTO }): Promise<{ id: string; status: string }> {
    const therapist = await this.therapistRepo.findById(id);
    if (!therapist) throw new NotFoundError("Therapist");

    await this.therapistRepo.updateStatus(id, dto.status);

    if (dto.status === THERAPIST_STATUS.APPROVED) {
      await sendTherapistApprovalEmail(therapist.email, therapist.name);
    } else if (dto.status === THERAPIST_STATUS.REJECTED) {
      await sendTherapistRejectionEmail(therapist.email, therapist.name);
    }

    return { id, status: dto.status };
  }
}
