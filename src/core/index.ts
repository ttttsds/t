// src/core/server.ts
import app from './app';
import connectDB from '../data/mongodb/client';

const PORT = process.env.PORT || 5000;

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

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Disconnected from database');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Disconnected from database');
  process.exit(0);
});

// Start the server
startServer();