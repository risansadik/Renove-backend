import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { TherapistModel } from "../infrastructure/databases/schema/therapist.schema.ts";
import { UserModel } from "../infrastructure/databases/schema/user.schema.ts";
import { BCRYPT_ROUNDS } from "../shared/constants/index.ts";

const run = async () => {
  const mongoUri = "mongodb+srv://risansadik_db_user:bmOvh6yOzFhPyQg7@cluster0.h7wjcvs.mongodb.net/";
  await mongoose.connect(mongoUri);
  console.log("Connected successfully");

  const hashedPassword = await bcrypt.hash("Password123!", BCRYPT_ROUNDS);

  // Set therapist
  await TherapistModel.updateOne(
    { email: "vaher50600@hidevak.com" },
    { $set: { password: hashedPassword } }
  );
  console.log("Updated therapist vaher50600@hidevak.com password to Password123!");

  // Set user
  await UserModel.updateOne(
    { email: "wededib451@hidevak.com" },
    { $set: { password: hashedPassword } }
  );
  console.log("Updated user wededib451@hidevak.com password to Password123!");

  await mongoose.disconnect();
};

run().catch(console.error);
