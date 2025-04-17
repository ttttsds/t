import * as mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    // Extract the database name from the URI or use a default
    const mongoUri = process.env.MONGODB_URI as string;
    let dbName = 'visualization_db'; // Default database name
    
    // Try to extract database name from URI if present
    const uriParts = mongoUri.split('?')[0].split('/');
    if (uriParts.length > 3 && uriParts[3]) {
      dbName = uriParts[3];
    }
    
    // Connect with explicit database name option
    const conn = await mongoose.connect(mongoUri, {
      dbName: dbName // Explicitly set the database name
    });
    
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
