import "dotenv/config";
import http from "http";
import app from "./app.ts";
import { connectDB } from "./infrastructure/databases/connect.ts";
import { initCronJobs } from "./infrastructure/scheduler.ts";
import { logger } from "./shared/utils/logger.ts";
import { socketServer } from "./infrastructure/socket/socket.server.ts";

const PORT = process.env.PORT ?? 5000;

const startServer = async (): Promise<void> => {
  await connectDB();
  initCronJobs();

  const httpServer = http.createServer(app);
  socketServer.init(httpServer);

  httpServer.listen(PORT, () => {
    logger.info(`reNove server running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
};

startServer().catch((err) => {
  logger.error("Failed to start server:", err);
  process.exit(1);
});
