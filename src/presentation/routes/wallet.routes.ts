import { Router } from "express";
import { WalletController } from "../controllers/wallet.controller.js";
import { GetWalletUseCase } from "../../application/use-cases/wallet/get-wallet.usecase.js";
import { WalletRepositoryImpl } from "../../infrastructure/repositories/wallet.repository.impl.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// Infrastructure
const walletRepo = new WalletRepositoryImpl();

// Use Cases
const getWalletUC = new GetWalletUseCase(walletRepo);

// Controller
const walletController = new WalletController(getWalletUC);

// Routes
router.get("/", authenticate, (req, res, next) => walletController.getWallet(req, res, next));

export default router;
