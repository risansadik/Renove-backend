import { inject, injectable } from "inversify";
import type { IFinanceRepository } from "../../../domain/repositories/finance.repository.ts";
import type { ISettingsRepository } from "../../../domain/repositories/settings.repository.ts";
import { HttpStatus } from "../../../shared/constants/index.ts";
import { AppError } from "../../../shared/utils/AppError.ts";
import type {
  IGetAdminFinanceStatsUseCase,
  IUpdatePlatformSettingsUseCase,
  IFinanceStatsResponse
} from '../../../application/interfaces/admin/IAdminUseCase.ts'
import { TYPES } from "../../../shared/constants/tokens.ts";
import { PaginationParams } from "../../../domain/interfaces/pagination.ts";


@injectable()
export class GetAdminFinanceStatsUseCase implements IGetAdminFinanceStatsUseCase {
  constructor(
    @inject(TYPES.SettingsRepository) private readonly _settingsRepo: ISettingsRepository,
    @inject(TYPES.FinanceRepository) private readonly _financeRepo: IFinanceRepository
  ) { }

  async execute(params: PaginationParams): Promise<IFinanceStatsResponse> {
    const [financeStats, commissionPercentage] = await Promise.all([
      this._financeRepo.getAdminFinanceStats(params.page,params.limit),
      this._settingsRepo.getCommissionPercentage(),
    ]);

    return {
      ...financeStats,
      commissionPercentage,
    };
  }
}

@injectable()
export class UpdatePlatformSettingsUseCase implements IUpdatePlatformSettingsUseCase {
  constructor(
    @inject(TYPES.SettingsRepository) private readonly _settingsRepo: ISettingsRepository
  ) { }

  async execute(percentage: number): Promise<{ success: boolean; message: string }> {
    if (percentage < 0 || percentage > 100) {
      throw new AppError("Commission percentage must be between 0 and 100", HttpStatus.BAD_REQUEST);
    }
    await this._settingsRepo.updateCommissionPercentage(percentage);
    return { success: true, message: `Platform commission updated to ${percentage}%` };
  }
}
