import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.ts";
import type { UpdateTherapistStatusDTO } from "../../dto/auth/admin.dto.ts";
import {
  sendTherapistApprovalEmail,
  sendTherapistRejectionEmail,
} from "../../../infrastructure/external-services/email.service.ts";
import { THERAPIST_STATUS } from "../../../shared/constants/index.ts";
import { NotFoundError } from "../../../shared/utils/AppError.ts";

import type { IUpdateTherapistStatusUseCase } from "../../interfaces/admin/IAdminUseCase.ts";

export class UpdateTherapistStatusUseCase implements IUpdateTherapistStatusUseCase {
  constructor(private readonly _therapistRepo: ITherapistRepository) {}

  async execute({ id, dto }: { id: string; dto: UpdateTherapistStatusDTO }): Promise<{ id: string; status: string }> {
    const therapist = await this._therapistRepo.findById(id);
    if (!therapist) throw new NotFoundError("Therapist");

    await this._therapistRepo.updateStatus(id, dto.status);

    if (dto.status === THERAPIST_STATUS.APPROVED) {
      await sendTherapistApprovalEmail(therapist.email, therapist.name);
    } else if (dto.status === THERAPIST_STATUS.REJECTED) {
      await sendTherapistRejectionEmail(therapist.email, therapist.name);
    }

    return { id, status: dto.status };
  }
}
