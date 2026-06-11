import dns from "node:dns";
import mongoose from "mongoose";
import { HttpStatus } from "../../shared/constants/index.ts";
import { AppError } from "../../shared/utils/AppError.ts";
import { appContainer } from "../di/container.ts";
import { ILogger } from "../../application/interfaces/services/ILoggerService.ts";
import { TYPES } from "../../shared/constants/tokens.ts";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

export const connectDB = async (): Promise<void> => {

  const logger = appContainer.get<ILogger>(TYPES.Logger);
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) throw new AppError("MONGO_URI is not defined", HttpStatus.INTERNAL_SERVER_ERROR);

  await mongoose.connect(mongoUri).catch((error) => {
    logger.error("MongoDB connection failed:", error);
    process.exit(1);
  });

  logger.info("MongoDB connected successfully");

  // legacy index cleanup
  const collection = mongoose.connection.collection("bookings");
  const indexes = await collection.listIndexes().toArray().catch((err) => {
    logger.warn("Could not list legacy indexes:", err);
    return [];
  });
  
  const legacyIndex = indexes.find(idx => idx.name === "therapistId_1_date_1_slot_1");
  if (legacyIndex) {
    await collection.dropIndex("therapistId_1_date_1_slot_1").then(() => {
      logger.info("Dropped legacy index: therapistId_1_date_1_slot_1");
    }).catch((err) => {
      logger.warn("Could not drop legacy index therapistId_1_date_1_slot_1:", err);
    });
  }

  const slotIndex = indexes.find(idx => idx.name === "slotId_1");
  if (slotIndex && !slotIndex.partialFilterExpression) {
    await collection.dropIndex("slotId_1").then(() => {
      logger.info("Dropped legacy unique index: slotId_1 to migrate to partial filter expression index");
    }).catch((err) => {
      logger.warn("Could not drop legacy index slotId_1:", err);
    });
  }
};
