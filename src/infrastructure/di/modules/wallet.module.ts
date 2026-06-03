import type { Container } from "inversify";
import type { IGetWalletUseCase } from "../../../application/interfaces/wallet/IWalletUseCase.ts";
import { GetWalletUseCase } from "../../../application/use-cases/wallet/get-wallet.usecase.ts";
import { WalletController } from "../../../presentation/controllers/wallet.controller.ts";
import { TYPES } from "../../../shared/constants/tokens.ts";
import { WalletRepositoryImpl } from "../../repositories/wallet.repository.impl.ts";
import { IWalletRepository } from "../../../domain/repositories/wallet.repository.ts";

export const registerWalletModule = (container: Container): void => {
  container.bind<IGetWalletUseCase>(TYPES.GetWalletUseCase).to(GetWalletUseCase)

  container.bind<IWalletRepository>(TYPES.WalletRepository).to(WalletRepositoryImpl).inSingletonScope();

  container.bind<WalletController>(TYPES.WalletController).to(WalletController).inSingletonScope();
};
