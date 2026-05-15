import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./infrastructure/databases/connect.js";
import { logger } from "./shared/utils/logger.js";

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
