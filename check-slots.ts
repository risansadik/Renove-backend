import mongoose from 'mongoose';
import { SlotModel } from './src/infrastructure/databases/schema/availability.schema.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkSlots() {
  await mongoose.connect(process.env.MONGO_URI!);
  const count = await SlotModel.countDocuments();
  console.log(`Total slots in DB: ${count}`);
  
  const slots = await SlotModel.find({ status: 'AVAILABLE' }).limit(5);
  console.log('Sample AVAILABLE slots:', JSON.stringify(slots, null, 2));
  
  await mongoose.disconnect();
}

checkSlots().catch(console.error);
