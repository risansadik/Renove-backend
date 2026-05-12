import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.js";
import type { UpdateTherapistStatusDTO } from "../../dto/auth/admin.dto.js";
import {
  sendTherapistApprovalEmail,
  sendTherapistRejectionEmail,
} from "../../../infrastructure/external-services/email.service.js";
import { THERAPIST_STATUS } from "../../../shared/constants/index.js";
import { NotFoundError } from "../../../shared/utils/AppError.js";

export class UpdateTherapistStatusUseCase {
  constructor(private readonly therapistRepo: ITherapistRepository) {}

  async execute(id: string, dto: UpdateTherapistStatusDTO) {
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
