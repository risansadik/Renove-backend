import cron from "node-cron";
import { appContainer } from "./di/container";
import { ExpirePaymentUseCase } from "../application/use-cases/payment/expire-payment.usecase";
import { TYPES } from "../shared/constants/tokens";
import { ILogger } from "../application/interfaces/services/ILoggerService";
import type { ISlotRepository } from "../domain/repositories/availability.repository";

export const initCronJobs = () => {
  const expirePaymentUC = appContainer.get<ExpirePaymentUseCase>(TYPES.ExpirePaymentUseCase);
  const slotRepo = appContainer.get<ISlotRepository>(TYPES.SlotRepository);
  const logger = appContainer.get<ILogger>(TYPES.Logger);

  // Run every minute
  cron.schedule("* * * * *", async () => {
    await expirePaymentUC.execute().catch((error) => {
      logger.error("Error in Payment Expiration Cron Job", { error });
    });
    await slotRepo.releaseExpiredLocks().catch((error) => {
      logger.error("Error releasing expired slot locks", { error });
    });
  });

  logger.info("Cron Jobs Initialized");
};
