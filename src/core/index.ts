// src/core/server.ts
import app from './app';
import connectDB from '../data/mongodb/client';

const PORT = process.env.PORT;

const startServer = async () => {
  try {
    // Connect to MongoDB database
    await connectDB();
    console.log('Connected to MongoDB database');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};
startServer();