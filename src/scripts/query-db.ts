import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import mongoose from "mongoose";
import { UserModel } from "../infrastructure/databases/schema/user.schema.js";
import { TherapistModel } from "../infrastructure/databases/schema/therapist.schema.js";

const run = async () => {
  const mongoUri = "mongodb+srv://risansadik_db_user:bmOvh6yOzFhPyQg7@cluster0.h7wjcvs.mongodb.net/";
  await mongoose.connect(mongoUri);
  console.log("Connected successfully");

  const users = await UserModel.find({}, "name email isVerified status");
  console.log("=== USERS ===");
  console.log(JSON.stringify(users, null, 2));

  const therapists = await TherapistModel.find({}, "name email isVerified status");
  console.log("=== THERAPISTS ===");
  console.log(JSON.stringify(therapists, null, 2));

  await mongoose.disconnect();
};

run().catch(console.error);
