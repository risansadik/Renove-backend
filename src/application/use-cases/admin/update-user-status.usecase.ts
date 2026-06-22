import type { IUserRepository } from "../../../domain/repositories/user.repository";
import type { UpdateUserStatusDTO } from "../../dto/auth/admin.dto";
import type { INotificationService } from "../../interfaces/services/INotificationService";
import { NotFoundError } from "../../../shared/utils/AppError";

import type { IUpdateUserStatusUseCase } from "../../interfaces/admin/IAdminUseCase";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/constants/tokens";

@injectable()
export class UpdateUserStatusUseCase implements IUpdateUserStatusUseCase {
  constructor(
    @inject(TYPES.UserRepository) private readonly _userRepo: IUserRepository,
    @inject(TYPES.NotificationService) private readonly _notificationService: INotificationService
  ) {}

  async execute({ id, dto }: { id: string; dto: UpdateUserStatusDTO }): Promise<{ id: string; status: string }> {
    const user = await this._userRepo.findById(id);
    if (!user) throw new NotFoundError("User");

    await this._userRepo.updateStatus(id, dto.status);

    if (dto.status === "blocked") {
      await this._notificationService.createAndEmit({
        recipientId: id,
        recipientRole: "user",
        type: "account_suspended",
        title: "Account Suspended",
        message: "Your account has been suspended by an administrator. Please contact support for assistance.",
      });
    } else if (dto.status === "active") {
      await this._notificationService.createAndEmit({
        recipientId: id,
        recipientRole: "user",
        type: "account_reactivated",
        title: "Account Reactivated",
        message: "Your account has been reactivated. You can now access all platform features.",
      });
    }

    return { id, status: dto.status };
  }
}
