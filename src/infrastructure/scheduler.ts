import cron from "node-cron";
import { appContainer } from "./di/container";
import { ExpirePaymentUseCase } from "../application/use-cases/payment/expire-payment.usecase";
import { TYPES } from "../shared/constants/tokens";
import { ILogger } from "../application/interfaces/services/ILoggerService";

export const initCronJobs = () => {
  const expirePaymentUC = appContainer.get<ExpirePaymentUseCase>(TYPES.ExpirePaymentUseCase);
  const logger = appContainer.get<ILogger>(TYPES.Logger);

  // Run every minute
  cron.schedule("* * * * *", async () => {
    await expirePaymentUC.execute().catch((error) => {
      logger.error("Error in Payment Expiration Cron Job", { error });
    });
  });

  logger.info("Cron Jobs Initialized");
};
