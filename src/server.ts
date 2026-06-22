import "dotenv/config";
import http from "http";
import app from "./app";
import { connectDB } from "./infrastructure/databases/connect";
import { initCronJobs } from "./infrastructure/scheduler";
import { ILogger } from "./application/interfaces/services/ILoggerService";
import { appContainer } from "./infrastructure/di/container";
import { TYPES } from "./shared/constants/tokens";
import { SocketServer } from "./infrastructure/socket/socket.server";

const logger = appContainer.get<ILogger>(TYPES.Logger);
const socketServer = appContainer.get<SocketServer>(TYPES.SocketServer);

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
