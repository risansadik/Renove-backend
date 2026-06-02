import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import type { IWalletRepository } from "../../../domain/repositories/wallet.repository.ts";
import type { TransactionEntity } from "../../../domain/entities/Transaction.entity.ts";
import { ROLES } from "../../../shared/constants/index.ts";
import type { PaginatedResult } from "../../../domain/interfaces/pagination.ts";
import type { IGetWalletUseCase, IGetWalletInput, WalletResult } from "../../interfaces/wallet/IWalletUseCase.ts";

@injectable()
export class GetWalletUseCase implements IGetWalletUseCase {
  constructor(
    @inject(TYPES.WalletRepository) private readonly _walletRepo: IWalletRepository
  ) {}

  async execute({ id, role, params }: IGetWalletInput): Promise<WalletResult> {
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