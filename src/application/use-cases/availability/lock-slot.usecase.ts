import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens";
import type { ISlotRepository } from "../../../domain/repositories/availability.repository";
import type { ILockSlotUseCase } from "../../interfaces/availability/IAvailabilityUseCase";
import { AppError, NotFoundError } from "../../../shared/utils/AppError";
import { HttpStatus } from "../../../shared/constants/index";

const LOCK_DURATION_MINUTES = 10;

@injectable()
export class LockSlotUseCase implements ILockSlotUseCase {
  constructor(
    @inject(TYPES.SlotRepository) private readonly _slotRepo: ISlotRepository
  ) {}

  async execute({ slotId, userId }: { slotId: string; userId: string }): Promise<{ lockExpiresAt: Date }> {
    await this._slotRepo.releaseExpiredLocks();

    const slot = await this._slotRepo.findById(slotId);
    if (!slot) throw new NotFoundError("Slot");

    if (slot.status !== "AVAILABLE") {
      throw new AppError("Slot is already booked", HttpStatus.BAD_REQUEST);
    }

    const lockExpiresAt = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
    const locked = await this._slotRepo.lockSlot(slotId, userId, lockExpiresAt);

    if (!locked) {
      throw new AppError("Slot was just taken by another user, please select a different slot", HttpStatus.CONFLICT);
    }

    return { lockExpiresAt };
  }
}