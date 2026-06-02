import cron from "node-cron";
import { appContainer } from "./di/container.ts";
import { ExpirePaymentUseCase } from "../application/use-cases/payment/expire-payment.usecase.ts";
import { TYPES } from "../shared/constants/tokens.ts";
import { logger } from "../shared/utils/logger.ts";

export const initCronJobs = () => {
  const expirePaymentUC = appContainer.get<ExpirePaymentUseCase>(TYPES.ExpirePaymentUseCase);

  // Run every minute
  cron.schedule("* * * * *", async () => {
    await expirePaymentUC.execute().catch((error) => {
      logger.error("Error in Payment Expiration Cron Job", { error });
    });
  });

  logger.info("Cron Jobs Initialized");
};
