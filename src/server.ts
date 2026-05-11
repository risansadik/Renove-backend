import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]); 

import "dotenv/config";
import app from "./app";
import { connectDB } from "./infrastructure/databases/connect";
import { logger } from "./shared/utils/logger";

const PORT = process.env.PORT ?? 5000;

const startServer = async (): Promise<void> => {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`reNove server running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
};

startServer().catch((err) => {
  logger.error("Failed to start server:", err);
  process.exit(1);
});