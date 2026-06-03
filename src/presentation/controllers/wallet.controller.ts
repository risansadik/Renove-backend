import type { Request, Response } from "express";
import { injectable, inject } from "inversify";
import type { IGetWalletUseCase } from "../../application/interfaces/wallet/IWalletUseCase.ts";
import { TYPES } from "../../shared/constants/tokens.ts";
import { PAGINATION, MESSAGES } from "../../shared/constants/index.ts";
import { ResponseModel } from "../../shared/utils/response-model.ts";
import type { AuthenticatedRequest } from "../../shared/types/express.ts";

@injectable()
export class WalletController {
  constructor(@inject(TYPES.GetWalletUseCase) private readonly _getWalletUC: IGetWalletUseCase) {}

  public getWallet = async (req: Request, res: Response): Promise<void> => {
    const { id, role } = (req as AuthenticatedRequest).user;
    const page = parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT;

    const result = await this._getWalletUC.execute({id, role,params: { page, limit }});
    
    const totalPages = Math.ceil(result.transactions.total / limit);

    res.json(ResponseModel.success(MESSAGES.WALLET.FETCHED, {
      wallet: result.wallet,
      transactions: result.transactions.data
    }, 200, {
      total: result.transactions.total,
      page,
      limit,
      totalPages
    }));
  };
}
