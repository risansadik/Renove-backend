import type { Container } from "inversify";
import type { IGetWalletUseCase } from "../../../application/interfaces/wallet/IWalletUseCase.ts";
import { GetWalletUseCase } from "../../../application/use-cases/wallet/get-wallet.usecase.ts";
import type { IWalletRepository } from "../../../domain/repositories/wallet.repository.ts";
import { WalletController } from "../../../presentation/controllers/wallet.controller.ts";
import { TYPES } from "../../../shared/constants/tokens.ts";

export const registerWalletModule = (container: Container): void => {
  container.bind<IGetWalletUseCase>(TYPES.GetWalletUseCase).toDynamicValue((context) =>
    new GetWalletUseCase(context.get<IWalletRepository>(TYPES.WalletRepository))
  );

  container.bind<WalletController>(TYPES.WalletController).to(WalletController).inSingletonScope();
};
