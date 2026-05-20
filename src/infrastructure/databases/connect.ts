import dns from "node:dns";
import mongoose from "mongoose";
import { logger } from "../../shared/utils/logger.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

export const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) throw new Error("MONGO_URI is not defined");

  try {
    await mongoose.connect(mongoUri);
    logger.info("MongoDB connected successfully");

    // legacy index cleanup
    try {
      const collection = mongoose.connection.collection("bookings");
      const indexes = await collection.listIndexes().toArray();
      
      const legacyIndex = indexes.find(idx => idx.name === "therapistId_1_date_1_slot_1");
      if (legacyIndex) {
        await collection.dropIndex("therapistId_1_date_1_slot_1");
        logger.info("Dropped legacy index: therapistId_1_date_1_slot_1");
      }

      const slotIndex = indexes.find(idx => idx.name === "slotId_1");
      if (slotIndex && !slotIndex.partialFilterExpression) {
        await collection.dropIndex("slotId_1");
        logger.info("Dropped legacy unique index: slotId_1 to migrate to partial filter expression index");
      }
    } catch (err) {
      logger.warn("Could not cleanup legacy indexes:", err);
    }
  } catch (error) {
    logger.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};
