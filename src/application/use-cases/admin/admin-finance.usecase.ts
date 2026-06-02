import type { IFinanceRepository } from "../../../domain/repositories/finance.repository.ts";
import type { ISettingsRepository } from "../../../domain/repositories/settings.repository.ts";
import { HttpStatus } from "../../../shared/constants/index.ts";
import { AppError } from "../../../shared/utils/AppError.ts";

export class GetAdminFinanceStatsUseCase {
  constructor(
    private readonly _settingsRepo: ISettingsRepository,
    private readonly _financeRepo: IFinanceRepository
  ) {}

  async execute() {
    const [financeStats, commissionPercentage] = await Promise.all([
      this._financeRepo.getAdminFinanceStats(),
      this._settingsRepo.getCommissionPercentage(),
    ]);

    return {
      ...financeStats,
      commissionPercentage,
    };
  }
}

export class UpdatePlatformSettingsUseCase {
  constructor(private readonly _settingsRepo: ISettingsRepository) {}

  async execute(percentage: number) {
    if (percentage < 0 || percentage > 100) {
      throw new AppError("Commission percentage must be between 0 and 100", HttpStatus.BAD_REQUEST);
    }
    await this._settingsRepo.updateCommissionPercentage(percentage);
    return { success: true, message: `Platform commission updated to ${percentage}%` };
  }
}
