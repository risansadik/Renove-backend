import type { Request, Response, NextFunction } from "express";
import { GetWalletUseCase } from "../../application/use-cases/wallet/get-wallet.usecase.ts";
import { ResponseModel } from "../../shared/utils/response-model.ts";
import type { AuthenticatedRequest } from "../../shared/types/express.ts";

export class WalletController {
  constructor(private _getWalletUC: GetWalletUseCase) {}

  async getWallet(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, role } = (req as AuthenticatedRequest).user;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this._getWalletUC.execute(id, role, { page, limit });
      
      const totalPages = Math.ceil(result.transactions.total / limit);

      res.json(ResponseModel.success("Wallet data fetched successfully", {
        wallet: result.wallet,
        transactions: result.transactions.data
      }, 200, {
        total: result.transactions.total,
        page,
        limit,
        totalPages
      }));
    } catch (err) {
      next(err);
    }
  }
}
