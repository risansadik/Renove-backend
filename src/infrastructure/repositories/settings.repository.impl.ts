import type { ISettingsRepository } from "../../domain/repositories/settings.repository.js";
import { SettingsModel } from "../databases/schema/settings.schema.js";

export class SettingsRepositoryImpl implements ISettingsRepository {
  async getCommissionPercentage(): Promise<number> {
    const doc = await SettingsModel.findOne({ key: "platform_commission" });
    if (!doc) {
      // Default to 15% if no value is set in DB yet
      return 15;
    }
    const val = Number(doc.value);
    return isNaN(val) ? 15 : val;
  }

  async updateCommissionPercentage(percentage: number): Promise<void> {
    await SettingsModel.findOneAndUpdate(
      { key: "platform_commission" },
      { value: percentage },
      { upsert: true, new: true }
    );
  }
}
