import type { PaginationParams } from "../../../domain/interfaces/pagination.ts";
import type { PaginatedResult } from "../../../domain/interfaces/pagination.ts";
import type { TherapistWalletEntity } from "../../../domain/entities/TherapistWallet.entity.ts";
import type { TransactionEntity } from "../../../domain/entities/Transaction.entity.ts";
import type { UserWalletEntity } from "../../../domain/entities/UserWallet.entity.ts";

export interface WalletResult {
  wallet: TherapistWalletEntity | UserWalletEntity;
  transactions: PaginatedResult<TransactionEntity>;
}

export interface IGetWalletUseCase {
  execute(id: string, role: string, params: PaginationParams): Promise<WalletResult>;
}
