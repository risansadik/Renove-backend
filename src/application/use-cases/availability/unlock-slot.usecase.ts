import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import type { ISlotRepository } from "../../../domain/repositories/availability.repository.ts";
import type { IUnlockSlotUseCase } from "../../interfaces/availability/IAvailabilityUseCase.ts";

@injectable()
export class UnlockSlotUseCase implements IUnlockSlotUseCase {
  constructor(
    @inject(TYPES.SlotRepository) private readonly _slotRepo: ISlotRepository
  ) {}

  async execute({ slotId, userId }: { slotId: string; userId: string }): Promise<void> {
    await this._slotRepo.unlockSlot(slotId, userId);
  }
}