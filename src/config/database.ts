import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

console.log('MONGODB_URI:', JSON.stringify(process.env.MONGODB_URI));

const MONGODB_URI = process.env.MONGODB_URI || '';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: process.env.MONGODB_DB || undefined,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}; 