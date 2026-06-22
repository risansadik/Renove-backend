import type { PaginationParams } from "../../../domain/interfaces/pagination";
import type { PaginatedResult } from "../../../domain/interfaces/pagination";
import type { TherapistWalletEntity } from "../../../domain/entities/TherapistWallet.entity";
import type { TransactionEntity } from "../../../domain/entities/Transaction.entity";
import type { UserWalletEntity } from "../../../domain/entities/UserWallet.entity";
import { IUseCase } from "../IUseCase";

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
