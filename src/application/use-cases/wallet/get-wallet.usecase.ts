import type { IWalletRepository } from "../../../domain/repositories/wallet.repository.ts";
import type { TransactionEntity } from "../../../domain/entities/Transaction.entity.ts";
import { ROLES } from "../../../shared/constants/index.ts";

import type { PaginationParams, PaginatedResult } from "../../../domain/interfaces/pagination.ts";

export class GetWalletUseCase {
  constructor(private _walletRepo: IWalletRepository) {}

  async execute(id: string, role: string, params: PaginationParams) {
    let wallet;
    let transactions: PaginatedResult<TransactionEntity> = { data: [], total: 0 };
    let walletType: "TherapistWallet" | "UserWallet";

    if (role === ROLES.THERAPIST) {
      wallet = await this._walletRepo.findByTherapistId(id);
      if (!wallet) {
        wallet = await this._walletRepo.createTherapistWallet({ therapistId: id });
      }
      walletType = "TherapistWallet";
    } else {
      wallet = await this._walletRepo.findByUserId(id);
      if (!wallet) {
        wallet = await this._walletRepo.createUserWallet({ userId: id });
      }
      walletType = "UserWallet";
    }

    if (wallet.id) {
      transactions = await this._walletRepo.getTransactions(wallet.id, walletType, params);
    }

    return { wallet, transactions };
  }
}
