import cron from "node-cron";
import { ExpirePaymentUseCase } from "../application/use-cases/payment/expire-payment.usecase.js";
import { logger } from "../shared/utils/logger.js";

export const initCronJobs = () => {
  const expirePaymentUC = new ExpirePaymentUseCase();

  // Run every minute
  cron.schedule("* * * * *", async () => {
    try {
      await expirePaymentUC.execute();
    } catch (error) {
      logger.error("Error in Payment Expiration Cron Job", { error });
    }
  });

  logger.info("Cron Jobs Initialized");
};
