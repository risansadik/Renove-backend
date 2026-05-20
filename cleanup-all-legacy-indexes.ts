import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function cleanupIndexes() {
  await mongoose.connect(process.env.MONGO_URI!);
  const collection = mongoose.connection.collection('bookings');
  
  const indexes = await collection.listIndexes().toArray();
  console.log('Current indexes on bookings:', JSON.stringify(indexes, null, 2));
  
  for (const index of indexes) {
    if (index.name === '_id_' || index.name === 'slotId_1') continue;
    
    const keys = Object.keys(index.key);
    if (keys.includes('date') || keys.includes('slot')) {
      console.log(`Dropping legacy index: ${index.name}`);
      await collection.dropIndex(index.name);
    }
  }
  
  console.log('Final index list:');
  const finalIndexes = await collection.listIndexes().toArray();
  console.log(JSON.stringify(finalIndexes, null, 2));
  
  await mongoose.disconnect();
}

cleanupIndexes().catch(console.error);
