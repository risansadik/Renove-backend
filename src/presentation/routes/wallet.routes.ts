import { Router } from "express";
import { appContainer } from "../../infrastructure/di/container.ts";
import { WalletController } from "../controllers/wallet.controller.ts";
import { authenticate } from "../../infrastructure/di/middlewares.ts";
import { TYPES } from "../../shared/constants/tokens.ts";
import { asyncHandler } from "../middlewares/async-handler.middleware.ts";

const router = Router();
const walletController = appContainer.get<WalletController>(TYPES.WalletController);

// Routes
router.get("/", authenticate, asyncHandler(walletController.getWallet));

export default router;
