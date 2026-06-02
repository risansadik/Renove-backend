import type { PaginationParams } from "../../../domain/interfaces/pagination.ts";
import type { PaginatedResult } from "../../../domain/interfaces/pagination.ts";
import type { TherapistWalletEntity } from "../../../domain/entities/TherapistWallet.entity.ts";
import type { TransactionEntity } from "../../../domain/entities/Transaction.entity.ts";
import type { UserWalletEntity } from "../../../domain/entities/UserWallet.entity.ts";
import { IUseCase } from "../IUseCase.ts";

export interface WalletResult {
  wallet: TherapistWalletEntity | UserWalletEntity;
  transactions: PaginatedResult<TransactionEntity>;
}

export interface IGetWalletInput {
  id: string;
  role: string;
  params: PaginationParams;
}

export type IGetWalletUseCase = IUseCase<IGetWalletInput, WalletResult>;
