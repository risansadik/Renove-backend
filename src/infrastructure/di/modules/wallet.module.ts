import type { Container } from "inversify";
import type { IGetWalletUseCase } from "../../../application/interfaces/wallet/IWalletUseCase";
import { GetWalletUseCase } from "../../../application/use-cases/wallet/get-wallet.usecase";
import { WalletController } from "../../../presentation/controllers/wallet.controller";
import { TYPES } from "../../../shared/constants/tokens";
import { WalletRepositoryImpl } from "../../repositories/wallet.repository.impl";
import { IWalletRepository } from "../../../domain/repositories/wallet.repository";

export const registerWalletModule = (container: Container): void => {
  container.bind<IGetWalletUseCase>(TYPES.GetWalletUseCase).to(GetWalletUseCase)

  container.bind<IWalletRepository>(TYPES.WalletRepository).to(WalletRepositoryImpl).inSingletonScope();

  container.bind<WalletController>(TYPES.WalletController).to(WalletController).inSingletonScope();
};
