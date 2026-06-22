import { inject, injectable } from "inversify";
import { type IAvailabilityRepository, type ISlotRepository } from "../../../domain/repositories/availability.repository";
import { ForbiddenError, NotFoundError } from "../../../shared/utils/AppError";
import { IDeleteAvailabilityRuleUseCase } from "../../interfaces/availability/IAvailabilityUseCase";
import { TYPES } from "../../../shared/constants/tokens";

@injectable()
export class DeleteAvailabilityRuleUseCase implements IDeleteAvailabilityRuleUseCase {
  constructor(
    @inject(TYPES.AvailabilityRepository) private readonly _availabilityRepo: IAvailabilityRepository,
    @inject(TYPES.SlotRepository) private readonly _slotRepo: ISlotRepository
  ) { }
  async execute({ id, therapistId }: { id: string; therapistId: string }): Promise<void> {
    const rule = await this._availabilityRepo.findById(id);
    if (!rule) {
      throw new NotFoundError("Availability rule");
    }

    if (rule.therapistId !== therapistId) {
      throw new ForbiddenError("Unauthorized availability rule access");
    }
    await this._availabilityRepo.delete(id);
    await this._slotRepo.deleteByAvailabilityId(id);
  }
}