import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.log('❌ MONGODB_URI not found in environment variables');
      console.log('💡 Running in demo mode without database');
      return;
    }
    
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log('❌ MongoDB connection failed - running in demo mode');
    console.log('💡 To fix this:');
    console.log('   1. Install MongoDB locally');
    console.log('   2. Or use MongoDB Atlas (cloud)');
    console.log('   3. Update MONGODB_URI in .env file');
  }
};