import { injectable, inject } from "inversify";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.ts";
import type { UpdateTherapistStatusDTO } from "../../dto/auth/admin.dto.ts";
import type { IEmailService } from "../../interfaces/services/IEmailService.ts";
import { THERAPIST_STATUS } from "../../../shared/constants/index.ts";
import { TYPES } from "../../../shared/constants/tokens.ts";
import { NotFoundError } from "../../../shared/utils/AppError.ts";

import type { IUpdateTherapistStatusUseCase } from "../../interfaces/admin/IAdminUseCase.ts";

@injectable()
export class UpdateTherapistStatusUseCase implements IUpdateTherapistStatusUseCase {
  constructor(
    @inject(TYPES.TherapistRepository) private readonly _therapistRepo: ITherapistRepository,
    @inject(TYPES.EmailService) private readonly _emailService: IEmailService
  ) {}

  async execute({ id, dto }: { id: string; dto: UpdateTherapistStatusDTO }): Promise<{ id: string; status: string }> {
    const therapist = await this._therapistRepo.findById(id);
    if (!therapist) throw new NotFoundError("Therapist");

    await this._therapistRepo.updateStatus(id, dto.status);

    if (dto.status === THERAPIST_STATUS.APPROVED) {
      await this._emailService.sendTherapistApprovalEmail(therapist.email, therapist.name);
    } else if (dto.status === THERAPIST_STATUS.REJECTED) {
      await this._emailService.sendTherapistRejectionEmail(therapist.email, therapist.name);
    }

    return { id, status: dto.status };
  }
}
