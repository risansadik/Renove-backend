import type { Request, Response } from "express";
import { injectable, inject } from "inversify";
import type { IGetWalletUseCase } from "../../application/interfaces/wallet/IWalletUseCase";
import { TYPES } from "../../shared/constants/tokens";
import { PAGINATION, MESSAGES } from "../../shared/constants/index";
import { ResponseModel } from "../../shared/utils/response-model";
import type { AuthenticatedRequest } from "../../shared/types/express";
import { WalletMapper } from "../../application/mappers/wallet.mapper";
import type { TherapistWalletEntity } from "../../domain/entities/TherapistWallet.entity";
import type { UserWalletEntity } from "../../domain/entities/UserWallet.entity";

@injectable()
export class WalletController {
  constructor(@inject(TYPES.GetWalletUseCase) private readonly _getWalletUC: IGetWalletUseCase) {}

  public getWallet = async (req: Request, res: Response): Promise<void> => {
    const { id, role } = (req as AuthenticatedRequest).user;
    const page = parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT;

    const result = await this._getWalletUC.execute({ id, role, params: { page, limit } });
    
    const totalPages = Math.ceil(result.transactions.total / limit);

    const walletDTO = role === "therapist"
      ? WalletMapper.toTherapistWalletDTO(result.wallet as TherapistWalletEntity)
      : WalletMapper.toUserWalletDTO(result.wallet as UserWalletEntity);

    res.json(ResponseModel.success(MESSAGES.WALLET.FETCHED, {
      wallet: walletDTO,
      transactions: WalletMapper.toTransactionDTOList(result.transactions.data)
    }, 200, {
      total: result.transactions.total,
      page,
      limit,
      totalPages
    }));
  };
}
