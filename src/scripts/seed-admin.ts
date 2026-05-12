import "dotenv/config";
import dns from "node:dns";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { AdminModel } from "../infrastructure/databases/schema/admin.schema.js";
import { BCRYPT_ROUNDS } from "../shared/constants/index.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const seedAdmin = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) throw new Error("MONGO_URI not set");

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");

  const email = process.env.ADMIN_EMAIL ?? "admin@renove.com";
  const password = process.env.ADMIN_PASSWORD ?? "Admin@123456";

  const existing = await AdminModel.findOne({ email });
  if (existing) {
    console.log("Admin already exists:", email);
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
  await AdminModel.create({ email, password: hashedPassword });

  console.log("Admin seeded successfully:", email);
  await mongoose.disconnect();
};

seedAdmin().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
