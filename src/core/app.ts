// src/core/app.ts
import express from 'express';
import cors from 'cors';
import { errorHandler } from '../shared/middlewares/ErrorHandling';

// Import routes
import APIsGateway from '../presentation/APIsGateway';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3025',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/', APIsGateway);

// Error handling
app.use(errorHandler);

export default app;