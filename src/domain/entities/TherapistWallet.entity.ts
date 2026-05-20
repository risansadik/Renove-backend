export interface TherapistWalletEntity {
  id?: string;
  therapistId: string;
  pendingBalance: number;
  availableBalance: number;
  withdrawnBalance: number;
  createdAt?: Date;
  updatedAt?: Date;
}
