export interface ISettingsRepository {
  getCommissionPercentage(): Promise<number>;
  updateCommissionPercentage(percentage: number): Promise<void>;
}
