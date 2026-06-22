import { Router } from "express";
import { appContainer } from "../../infrastructure/di/container";
import { WalletController } from "../controllers/wallet.controller";
import { authenticate } from "../../infrastructure/di/middlewares";
import { TYPES } from "../../shared/constants/tokens";
import { asyncHandler } from "../middlewares/async-handler.middleware";

const router = Router();
const walletController = appContainer.get<WalletController>(TYPES.WalletController);

// Routes
router.get("/", authenticate, asyncHandler(walletController.getWallet));

export default router;
