import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function dropIndex() {
  await mongoose.connect(process.env.MONGO_URI!);
  const collection = mongoose.connection.collection('bookings');
  
  try {
    await collection.dropIndex('therapistId_1_date_1_slot_1');
    console.log('Legacy index therapistId_1_date_1_slot_1 dropped successfully.');
  } catch (error: any) {
    console.log('Index might not exist or already dropped:', error.message);
  }
  
  await mongoose.disconnect();
}

dropIndex().catch(console.error);
