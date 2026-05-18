import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function run() {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/renove";
  console.log("Connecting to MongoDB:", mongoUri);
  await mongoose.connect(mongoUri);
  
  const collection = mongoose.connection.collection("bookings");
  const indexes = await collection.listIndexes().toArray();
  console.log("Current indexes on bookings collection:");
  console.log(JSON.stringify(indexes, null, 2));

  const hasSlotIdIndex = indexes.some(idx => idx.name === "slotId_1");
  if (hasSlotIdIndex) {
    console.log("Dropping index 'slotId_1'...");
    await collection.dropIndex("slotId_1");
    console.log("Successfully dropped legacy 'slotId_1' index!");
  } else {
    console.log("Index 'slotId_1' not found on bookings collection.");
  }

  console.log("Final index list:");
  const finalIndexes = await collection.listIndexes().toArray();
  console.log(JSON.stringify(finalIndexes, null, 2));

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

run().catch(console.error);
